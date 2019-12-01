import { useEffect } from 'react';
import { useStores } from '../contexts/store-context';
import { getCounts } from '../utils/stats';

export function useExtension(preprintId) {
  const { preprintsWithActionsStore } = useStores();

  useEffect(() => {
    window.postMessage(
      {
        type: 'HAS_GSCHOLAR',
        payload: { hasGscholar: true }
      },
      '*'
    );

    function update(preprintWithActions) {
      if (!preprintWithActions) return;

      const counts = getCounts(preprintWithActions.potentialAction);

      window.postMessage(
        {
          type: 'STATS',
          payload: counts
        },
        '*'
      );
    }

    if (preprintId) {
      update(preprintsWithActionsStore.peek(preprintId));
    }

    preprintsWithActionsStore.on('SET', update);
    return () => {
      preprintsWithActionsStore.removeListener('SET', update);
    };
  }, [preprintId, preprintsWithActionsStore]);
}
