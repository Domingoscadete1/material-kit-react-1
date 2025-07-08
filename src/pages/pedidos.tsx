import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PedidosView } from 'src/sections/pedidos/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Produtos Por entregar `}</title>
      </Helmet>

      <PedidosView />
    </>
  );
}
