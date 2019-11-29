import { useEffect } from 'react';
import { useStores } from '../contexts/store-context';
import { getCounts } from '../utils/stats';

export function useExtension(preprintId) {
  const { preprintsWithActionsStore } = useStores();

  useEffect(() => {
    let update,
      intervalId,
      nTry = 0;

    if (window.chrome && window.chrome.runtime) {
      intervalId = setInterval(() => {
        const $meta = document.querySelector(
          'meta[name="rapid-prereview-extension-id"]'
        );
        if ($meta) {
          const extensionId = $meta.getAttribute('content');

          update = preprintWithActions => {
            if (!preprintWithActions) return;

            const counts = getCounts(preprintWithActions.potentialAction);

            window.chrome.runtime.sendMessage(extensionId, {
              type: 'STATS',
              payload: counts
            });
          };

          window.chrome.runtime.sendMessage(extensionId, {
            type: 'HAS_GSCHOLAR',
            payload: { hasGscholar: true }
          });

          if (preprintId) {
            update(preprintsWithActionsStore.peek(preprintId));
          }

          preprintsWithActionsStore.on('SET', update);

          clearInterval(intervalId);
        } else {
          update = null;
          nTry++;
          if (nTry++ > 10) {
            clearInterval(intervalId);
          }
        }
      }, 100);
      return () => {
        clearInterval(intervalId);
        if (update) {
          preprintsWithActionsStore.removeListener('SET', update);
        }
      };
    }
  }, [preprintId, preprintsWithActionsStore]);
}
