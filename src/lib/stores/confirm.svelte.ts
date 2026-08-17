export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    hideCancel?: boolean;
}

class ConfirmStore {
    isOpen = $state(false);
    options = $state<ConfirmOptions | null>(null);
    private resolve: ((value: boolean) => void) | null = null;

    request(options: ConfirmOptions): Promise<boolean> {
        this.options = options;
        this.isOpen = true;
        
        return new Promise((res) => {
            this.resolve = res;
        });
    }

    respond(result: boolean) {
        this.isOpen = false;
        if (this.resolve) {
            this.resolve(result);
            this.resolve = null;
        }
        
        // Limpiamos las opciones después de la animación de cierre (aprox 200ms)
        setTimeout(() => {
            if (!this.isOpen) {
                this.options = null;
            }
        }, 200);
    }
}

export const confirmStore = new ConfirmStore();

/**
 * Muestra un modal de confirmación global y espera la respuesta del usuario.
 * @param options Opciones del modal de confirmación
 * @returns Promesa que se resuelve en `true` si el usuario confirma, `false` si cancela.
 */
export const confirm = (options: ConfirmOptions) => confirmStore.request(options);

/**
 * Muestra un modal de alerta global con un solo botón de Aceptar.
 * @param message Mensaje de la alerta
 * @param type Tipo de alerta
 * @param title Título del modal
 */
export const alertMsg = (message: string, type: 'danger' | 'warning' | 'info' | 'success' = 'info', title: string = 'Aviso') => 
    confirmStore.request({
        title,
        message,
        confirmText: 'Aceptar',
        type,
        hideCancel: true
    });
