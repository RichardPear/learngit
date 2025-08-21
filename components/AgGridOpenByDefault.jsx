'use client';

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  StrictMode,
} from 'react';
import { createRoot } from 'react-dom/client';
import { AgGridReact } from 'ag-grid-react';
import {
  ClientSideRowModelModule,
  ModuleRegistry,
  NumberFilterModule,
  TextFilterModule,
  ValidationModule,
} from 'ag-grid-community';
import { RowGroupingModule, AllEnterpriseModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
  TextFilterModule,
  NumberFilterModule,
  ClientSideRowModelModule,
  AllEnterpriseModule,
  RowGroupingModule,
  ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);
import { useFetchJson } from './useFetchJson';

const GridExample = () => {
  const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);

  const [columnDefs, setColumnDefs] = useState([
    { field: 'country' },
    { field: 'year'},
    { field: 'sport' },
    { field: 'athlete' },
    { field: 'total' },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      enableRowGroup: true,
      minWidth: 100,
      filter: true,
    };
  }, []);
  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 200,
    };
  }, []);

  // Keep track of open routes
  const openRoutes = useRef({});

  const isGroupOpenByDefault = useCallback((params) => {
    const route = params.rowNode.getRoute();

    return Object.entries(openRoutes.current).some(([key, destPath]) => {
      const match = !!route?.every((item, idx) => destPath[idx] === item);
      console.log(destPath, match);
      return match;
    });
  }, []);

  const { data, loading } = useFetchJson(
    'https://www.ag-grid.com/example-assets/small-olympic-winners.json'
  );

  const onStateUpdated = useCallback((params) => {
    const currState = params.node.getRoute();
    const key = currState.join('_');
    if (params.expanded) {
      openRoutes.current[key] = currState;
    } else {
      delete openRoutes.current[key];
    }
    console.log('Current routes', openRoutes.current);
  }, []);

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          rowData={data}
          loading={loading}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDef}
          isGroupOpenByDefault={isGroupOpenByDefault}
          onRowGroupOpened={onStateUpdated}
          rowGroupPanelShow="always"
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <GridExample />
  </StrictMode>
);
