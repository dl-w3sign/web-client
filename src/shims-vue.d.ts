declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'snarkjs' {
  const groth16 = {
    fullProve: (
      _input: any,
      wasmFile: string,
      zkeyFileName: string,
      logger?: any,
    ) => any,
  }
  export { groth16 }
}
