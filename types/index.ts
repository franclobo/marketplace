export enum StorageCategory {
  Belleza = "Belleza",
  Limpieza = "Limpieza",
  Decoracion = "Decoración",
  Electronica = "Electrónica",
  Educacion = "Educación",
  ServicioTecnico = "Servicio Técnico",
  Alimentos = "Alimentos",
  Transporte = "Transporte",
  Plomeria = "Plomería",
  Cerrajeria = "Cerrajería",
  Otros = "Otros",
}

export type RootStackParamList = {
  "business-list": { category: string };
  "business-detail": {
    business: {
      id: string;
      name: string;
      email: string;
      address: string;
      phone: string;
      category: string;
      description: string;
      banner: string;
    };
  };
};

export type RouteParams = {
  params: { category: string };
}

export interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  products: []; // Cambia 'any' por el tipo adecuado si es posible
  owner: string; // O el tipo adecuado
  category: string;
  banner: string;
}
