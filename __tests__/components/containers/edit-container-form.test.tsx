import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { EditContainerForm } from "@/components/containers/edit-container-form";
import { ContainerService } from "@/services/containers/container.service";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

jest.mock("@/services/containers/container.service");
jest.mock("@/hooks/use-toast");
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock del componente ContainerForm para simplificar tests
jest.mock("@/components/containers/container-form", () => ({
  ContainerForm: ({ container, onSubmit, isLoading }: any) => (
    <div>
      <div>ContainerForm mock - {container?.name}</div>
      <button onClick={() => onSubmit({ id: container.id, name: "nuevo nombre" })} disabled={isLoading}>
        Enviar
      </button>
    </div>
  ),
}));

describe("EditContainerForm", () => {
  const containerId = "123";
  const containerData = { id: containerId, name: "Contenedor Original" };
  const toastMock = jest.fn();
  const pushMock = jest.fn();
  const backMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ toast: toastMock });
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      back: backMock,
    });
  });

  it("muestra loader mientras carga el contenedor", async () => {
    (ContainerService.getById as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // promesa pendiente para simular carga
    );

    render(<EditContainerForm containerId={containerId} />);
    expect(screen.getByText("Cargando contenedor...")).toBeInTheDocument();
  });

  it("muestra error y redirige si falla carga de contenedor", async () => {
    (ContainerService.getById as jest.Mock).mockRejectedValue(new Error("Falló carga"));

    render(<EditContainerForm containerId={containerId} />);
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: "Error al cargar contenedor",
        description: "Falló carga",
        variant: "destructive",
      });
      expect(pushMock).toHaveBeenCalledWith("/admin/management/containers");
    });
  });

  it("envía datos sin archivo, muestra toast éxito y redirige", async () => {
    (ContainerService.getById as jest.Mock).mockResolvedValue(containerData);
    (ContainerService.update as jest.Mock).mockResolvedValue(undefined);

    render(<EditContainerForm containerId={containerId} />);
    await waitFor(() => screen.getByText("Enviar"));

    const submitButton = screen.getByText("Enviar");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(ContainerService.update).toHaveBeenCalledWith(containerId, { id: containerId, name: "nuevo nombre" });
      expect(toastMock).toHaveBeenCalledWith({
        title: "¡Contenedor actualizado exitosamente!",
        description: `El contenedor "nuevo nombre" ha sido actualizado correctamente.`,
      });
      expect(pushMock).toHaveBeenCalledWith("/admin/management/containers");
    });
  });

  it("muestra toast error al fallar actualización", async () => {
    (ContainerService.getById as jest.Mock).mockResolvedValue(containerData);

    (ContainerService.update as jest.Mock).mockRejectedValue({
      response: { data: { message: "Error personalizado" } },
    });

    render(<EditContainerForm containerId={containerId} />);
    await waitFor(() => screen.getByText("Enviar"));

    fireEvent.click(screen.getByText("Enviar"));

    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith({
        title: "Error al actualizar contenedor",
        description: "Error personalizado",
        variant: "destructive",
      });
    });
  });
});
