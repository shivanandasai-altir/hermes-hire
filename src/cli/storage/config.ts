import Conf from "conf";

export interface CliConfig {
  activeUserId?: string;
  hermesApiKey?: string;
  hermesApiUrl?: string;
  hermesModel?: string;
  vapiApiKey?: string;
}

const config = new Conf<CliConfig>({
  projectName: "hermeshire",
  defaults: {
    hermesApiUrl: "https://inference-api.nousresearch.com/v1",
    hermesModel: "Hermes-4-70B",
  },
});

export function getConfig(): CliConfig {
  return config.store;
}

export function setConfig(key: keyof CliConfig, value: string) {
  config.set(key, value);
}

export function clearConfig() {
  config.clear();
}

export default config;
