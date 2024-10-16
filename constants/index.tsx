import welcome from '@/assets/images/welcome.png';
import tienda from '@/assets/images/tienda.png';
import pago from '@/assets/images/pago.png';

export const images = {
  welcome,
  tienda,
  pago,
}

const onboarding = [
  {
    id: 1,
    title: "Ofrece tus productos y servicios en un solo lugar con Marketplace",
    description: "Sin comisiones, los clientes te contactarán directamente.",
    image: images.welcome,
  },
  {
    id: 2,
    title: "¡Crea tu perfil y empieza a compar y vender ahora!",
    description: "Tus clientes y proveedores a un click de distancia",
    image: images.tienda,
  },
  {
    id: 3,
    title: "Tu negocio, tu dinero.",
    description:
      "Tú decides el precio y la forma de pago, ambos pueden negociar directamente.",
    image: images.pago,
  },
];

export default onboarding
