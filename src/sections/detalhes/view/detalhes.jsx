import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Unstable_Grid2';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function DetalhesView() {
  const [mainImage, setMainImage] = useState("https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7o1UqwTqFhZnCHiL_ImyZSCgEgtFvVZoAqRJWs14MSm9w8zINDOEGUO9jvG6HLrmZajOP4asLgwAfX2sz6uvVEa38ELhPsmHdtEUQVNro3PrMlUlqjN65CWzzSmeBtWxHmjs3gGORwcaGRSB8ktJbbJ63bGusEOf7ibX6ttketOLEetfRyzbipr_HHg/s3840/Spirited%20Away%20Studio%20Ghibli%204K%20PC%20Desktop%20Wallpaper.png");
  const [quantity, setQuantity] = useState(1); // Estado para controlar a quantidade

  const product = {
    name: "Produto Exemplo2",
    description: "Descrição detalhada do produto.",
    category: "Tecnologia",
    quantity: 2,
    status: "À venda",
    price: "250.99 AOA",
    images: [
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7o1UqwTqFhZnCHiL_ImyZSCgEgtFvVZoAqRJWs14MSm9w8zINDOEGUO9jvG6HLrmZajOP4asLgwAfX2sz6uvVEa38ELhPsmHdtEUQVNro3PrMlUlqjN65CWzzSmeBtWxHmjs3gGORwcaGRSB8ktJbbJ63bGusEOf7ibX6ttketOLEetfRyzbipr_HHg/s3840/Spirited%20Away%20Studio%20Ghibli%204K%20PC%20Desktop%20Wallpaper.png',
      'https://www.chromethemer.com/download/hd-wallpapers/minimalist-spiderman-3840x2160.jpg',
      'https://wallpapercat.com/w/full/b/8/f/6645-3840x2160-desktop-4k-assassins-creed-background-photo.jpg',
      'https://wallpapersko.com/wp-content/uploads/2018/06/hd-wallpaper-4k.jpg',
      'https://img.freepik.com/fotos-premium/borboletas-coloridas-imagem-gerada-pela-ia_268835-6554.jpg',
    ]
  };

  const handleThumbnailClick = (image) => {
    setMainImage(image);
  };

  const handleIncrement = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prevQuantity => prevQuantity - 1);
    }
  };

  return (
    <DashboardContent>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Detalhes do Produto
      </Typography>

      <Card sx={{ maxWidth: "100%", padding: 2 }}>
        <Grid container spacing={2}>
          {/* Coluna da imagem principal e miniaturas */}
          <Grid xs={12} md={6}>
            <CardMedia
              component="img"
              height="400"
              image={mainImage}
              alt={product.name}
              sx={{ width: '100%', borderRadius: 1, marginBottom: 2 }}
            />

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              {product.images.map((image, index) => (
                <CardMedia
                  key={index}
                  component="img"
                  height="60"
                  image={image}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => handleThumbnailClick(image)}
                  sx={{ width: 60, cursor: "pointer", borderRadius: 1, border: mainImage === image ? '2px solid blue' : 'none' }}
                />
              ))}
            </Box>
          </Grid>

          <Grid xs={12} md={6}>
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {product.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categoria: {product.category}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Quantidade: {product.quantity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {product.status}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Preço: {product.price}
              </Typography>

              <Card variant="outlined" sx={{ padding: 2, border: '1px solid #ddd', borderRadius: 1, }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  250.99 AOA
                </Typography>
                
                <Typography variant="h7">
                  Quantidade: 
                </Typography>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2, mb: 2 }}>
                  <Button variant="outlined" onClick={handleDecrement}>-</Button>
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    inputProps={{ min: 1 }}
                    sx={{ width: '80px', }}
                  />
                  <Button variant="outlined" onClick={handleIncrement}>+</Button>
                </Box>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="contained" color="primary">
                    Comprar
                  </Button>
                </Box>
              </Card>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </DashboardContent>
  );
}