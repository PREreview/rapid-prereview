import React, { useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AvatarEditor from 'react-avatar-editor';
import { useDropzone } from 'react-dropzone';
import Button from './button';
import Controls from './controls';
import TextInput from './text-input';
import { usePostAction } from '../hooks/api-hooks';
import { getId } from '../utils/jsonld';

export default function RoleEditor({ user, role, onCancel, onSaved }) {
  const editorRef = useRef();
  const [name, setName] = useState(role.name);
  const [image, setImage] = useState(role.avatar && role.avatar.contentUrl);
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [post, postProgressData] = usePostAction();

  const onDrop = useCallback(acceptedFiles => {
    const [file] = acceptedFiles;
    setScale(1);
    setRotate(0);
    setFile(file);

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

  const hasNewAvatar = !!file || (!file && (rotate !== 0 || scale !== 1));

  return (
    <div>
      <TextInput
        label="Display Name"
        value={name}
        onChange={e => {
          setName(e.target.value);
        }}
      />

      {/* The Dropzone. Note that we remove the input if an image is present so that when user move the image with DmD it doesn't open the file picker */}
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

      {/* Control to allow users to open the file picker (and to replace the one on the canvas). Once a file is in the canvas clicking on the canvas does _not_ open the file picker so this is necessary  */}
      <label htmlFor="role-editor-input">
        Click here to upload {image ? 'another' : 'a'} file or drag and drop it
        to the area above.
      </label>
      <input {...getInputProps()} id="role-editor-input" />

      {!!image && (
        <div>
          <span>
            Drag the image to select the part that you want part of your avatar
          </span>

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

      <Controls error={postProgressData.error}>
        <Button
          disabled={postProgressData.isActive}
          onClick={() => {
            onCancel();
          }}
        >
          Cancel
        </Button>

        <Button
          disabled={
            (name === role.name && !hasNewAvatar) || postProgressData.isActive
          }
          onClick={() => {
            const payload = {};
            if (role.name !== name) {
              payload.name = name;
            }
            if (hasNewAvatar) {
              const canvas = editorRef.current.getImage();

              // We need to keep the base64 string small to avoid hitting the
              // size limit on JSON documents for Cloudant
              let q = 0.92;
              let dataUrl = canvas.toDataURL('image/jpeg', q);
              while (dataUrl.length > 200000 && q > 0.1) {
                q -= 0.05;
                dataUrl = canvas.toDataURL('image/jpeg', q);
              }

              payload.avatar = {
                '@type': 'ImageObject',
                encodingFormat: file.type,
                contentUrl: dataUrl
              };
            }

            post(
              {
                '@type': 'UpdateRoleAction',
                agent: getId(user),
                actionStatus: 'CompletedActionStatus',
                object: getId(role),
                payload
              },
              action => {
                onSaved(action);
              }
            );
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
  user: PropTypes.shape({
    '@id': PropTypes.string.isRequired
  }).isRequired,
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
