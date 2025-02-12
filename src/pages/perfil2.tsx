import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Perfil2View } from 'src/sections/perfil2/view';

export default function Page() {
  const { id, tipo } = useParams<{ id: string; tipo: string }>();

  if (!id || !tipo) {
    return <p>Erro: Parâmetros inválidos.</p>;
  }

  return (
    <>
      <Helmet>
        <title>Perfil de Usuário</title>
      </Helmet>

      <Perfil2View />
    </>
  );
}
