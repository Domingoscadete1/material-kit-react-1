import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DetalhesView } from 'src/sections/detalhes/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
        <title> {`Detalhes Produto `}</title>

      < DetalhesView />
    </>
  );
}
