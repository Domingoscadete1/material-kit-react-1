import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { FuncionarioView } from 'src/sections/funcionario/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {`Funcionários `}</title>
      </Helmet>

      <FuncionarioView />
    </>
  );
}
