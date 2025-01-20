import { Helmet } from 'react-helmet-async';

import { ListaView } from 'src/sections/lista/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Lista de Mensagens `}</title>
      </Helmet>

      <ListaView />
    </>
  );
}
