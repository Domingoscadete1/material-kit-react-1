import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { Perfil2View } from 'src/sections/perfil2/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Perfil2 `}</title>
      </Helmet>

      <Perfil2View />
    </>
  );
}
