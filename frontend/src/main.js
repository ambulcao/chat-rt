import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ApolloProvider } from '@apollo/client';
import { client } from './apolloClient.ts';
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(ApolloProvider, { client: client, children: _jsx(App, {}) }) }));
