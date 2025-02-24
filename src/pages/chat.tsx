import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ChatView } from 'src/sections/chat/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Mensagens `}</title>
      </Helmet>

      < ChatView />
    </>
  );
}
