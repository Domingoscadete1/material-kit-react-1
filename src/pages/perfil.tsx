import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PerfilView } from 'src/sections/perfil/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Perfil `}</title>
      </Helmet>

      <PerfilView />
    </>
  );
}
