import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RelatorioView } from 'src/sections/relatorio/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Relatório `}</title>
      </Helmet>

      <RelatorioView />
    </>
  );
}
