declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'snarkjs' {
  export const groth16 = {
    // eslint-disable-next-line
    fullProve: (_input: unknown, wasmFile: string, zkeyFileName: string) => any,
  }
}
