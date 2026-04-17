export const swrKeys = {
  categorias: 'categorias',
  denuncias: 'denuncias',
  denunciaById: (id: string) => `denuncias/${id}`,
  myDenuncias: (userId: string) => `my-denuncias/${userId}`,
  profile: (userId: string) => `profile/${userId}`,
}