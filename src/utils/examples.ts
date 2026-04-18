import { useDenuncias } from "@/src/hooks/useDenuncias";
import { signIn, signUp } from "@/src/services/auth";
import { createDenuncia } from "@/src/services/denuncias";
import { Alert } from "react-native";

async function handleCreate() {
  const { denuncias, isLoading, error, mutate } = useDenuncias();

  try {
    await createDenuncia({
      user_id: "a305e6bb-857c-4703-873d-895a5818d6c5",
      categoria_id: 1,
      titulo: "Ala o agamento",
      descricao: "Água acumulada bloqueando passagem",
      latitude: -23.55052,
      longitude: -46.633308,
      endereco: "Centro, São Paulo",
    });
    await mutate();
    console.log("Denuncia Criada");

    Alert.alert("Sucesso", "Denúncia criada com sucesso.");
  } catch (error) {
    console.log(error);
    Alert.alert("Erro", "Não foi possível criar a denúncia.");
  }
}

async function CreateUser() {
  try {
    const result = await signUp({
      nome: "Teste",
      email: `teste@test.com`, // evita duplicação
      password: "12345678",
    });

    console.log("Usuário criado:", result);

    Alert.alert("Sucesso", "Usuário criado com sucesso!");
  } catch (error: any) {
    console.error(error);

    Alert.alert("Erro", error.message ?? "Erro ao criar usuário.");
  }
}

async function Login() {
  try {
    const result = await signIn({
      email: `teste@teste.com`, // evita duplicação
      password: "12345678",
    });
    console.log(result);
    Alert.alert(
      "Sucesso",
      result.user?.email
        ? `Logado como ${result.user.email}`
        : "Login realizado com sucesso.",
    );
  } catch (error: any) {
    Alert.alert("Erro", error.message);
  }
}
