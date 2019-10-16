import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import Button from './button';
import Controls from './controls';
import TextInput from './text-input';

export default function RoleEditor({ role, onCancel, onSaved }) {
  const editorRef = useRef();
  const [image, setImage] = useState(role.avatar && role.avatar.contentUrl);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);

  const onDrop = useCallback(acceptedFiles => {
    const [file] = acceptedFiles;

    const reader = new FileReader();

    reader.onabort = () => {
      console.log('file reading was aborted');
    };
    reader.onerror = () => {
      console.log('file reading has failed');
    };
    reader.onload = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    noClick: !!image,
    multiple: false,
    disabled: false,
    accept: 'image/jpeg, image/png',
    onDrop
  });

  return (
    <div>
      <TextInput label="Display Name" />

      <div {...getRootProps()}>
        <AvatarEditor
          ref={editorRef}
          image={image}
          width={150}
          height={150}
          border={50}
          scale={scale}
          rotate={rotate}
        />
        {!image && <input {...getInputProps()} />}
      </div>

      {!!image && (
        <div>
          <input {...getInputProps()} style={{ display: '' }} />

          <input
            type="range"
            id="role-editor-scale"
            name="scale"
            min={1}
            max={25}
            step={0.1}
            onChange={e => {
              setScale(parseFloat(e.target.value));
            }}
            value={scale}
          />
          <label htmlFor="role-editor-scale">Zoom</label>

          <Button
            onClick={() => {
              setRotate((rotate + 90) % 360);
            }}
          >
            Rotate
          </Button>
        </div>
      )}

      <Controls>
        <Button
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            const canvas = editorRef.current.getImage();

            // We need to keep the base64 string small to avoid hitting the
            // size limit on JSON documents for Cloudant
            let q = 0.92;
            let dataUrl = canvas.toDataURL('image/jpeg', q);
            while (dataUrl.length > 200000 && q > 0.1) {
              q -= 0.05;
              dataUrl = canvas.toDataURL('image/jpeg', q);
            }

            onSaved();
          }}
        >
          Submit
        </Button>
      </Controls>
    </div>
  );
}

RoleEditor.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
  role: PropTypes.shape({
    '@id': PropTypes.string.isRequired,
    '@type': PropTypes.oneOf(['PublicReviewerRole', 'AnonymousReviewerRole']),
    name: PropTypes.string,
    avatar: PropTypes.shape({
      '@type': PropTypes.oneOf(['ImageObject']),
      encodingFormat: PropTypes.oneOf(['image/jpeg', 'image/png']),
      contentUrl: PropTypes.string // base64
    })
  })
};
