import { createBrowserRouter } from 'react-router-dom';
import InterceptedEmail from './pages/InterceptedEmail';
import SecureLinkPortal from './pages/SecureLinkPortal';
import InvoiceDetails from './pages/InvoiceDetails';
import InvoiceAudit from './pages/InvoiceAudit';
import ErrorPage from './pages/ErrorPage';
import Mailbox from './pages/Mailbox';
import MagicLinkGate from './pages/MagicLinkGate';
import TempLinkGate from './pages/TempLinkGate';
import Result from './pages/Result';
import Layout from './components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <InterceptedEmail />,
      },
      {
        path: 'intercepted',
        element: <InterceptedEmail />,
      },
      {
        path: 'mailbox',
        element: <Mailbox />,
      },
      {
        path: 'link/magic/:token',
        element: <MagicLinkGate />,
      },
      {
        path: 'link/temp/:token',
        element: <TempLinkGate />,
      },
      {
        path: 'portal/:messageId',
        element: <SecureLinkPortal />,
      },
      {
        path: 'invoice/:messageId',
        element: <InvoiceDetails />,
      },
      {
        path: 'invoice/:messageId/audit',
        element: <InvoiceAudit />,
      },
      {
        path: 'result',
        element: <Result />,
      },
      {
        path: 'error',
        element: <ErrorPage />,
      },
    ]
  },
]);
