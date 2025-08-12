'use client'

import { useEffect, useState } from "react";

export default function Home() {
  const [valueFromSecret, setValueFromSecret] = useState("");
  const [valueFromModuleVariable, setValueFromModuleVariable] = useState("");
  const [valueFromEnvironmentConfig, setValueFromEnvironmentConfig] = useState("");

  useEffect(() => {
    setValueFromSecret(process.env.NEXT_PUBLIC_VALUE_FROM_SECRET || "");
    setValueFromModuleVariable(process.env.NEXT_PUBLIC_VALUE_FROM_MODULE_VARIABLE || "");
    setValueFromEnvironmentConfig(process.env.NEXT_PUBLIC_VALUE_FROM_ENVIRONMENT_CONFIG || "");
  }, []);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-3xl font-semibold mb-4">Hello Apollo!</div>
        {valueFromSecret && (
          <div className="text-xl mb-4">
            Value from Secret: {valueFromSecret}
          </div>
        )}
        {valueFromModuleVariable && (
          <div className="text-xl mb-4">
            Value from Module Variable: {valueFromModuleVariable}
          </div>
        )}
        {valueFromEnvironmentConfig && (
          <div className="text-xl mb-4">
            Value from Environment Config: {valueFromEnvironmentConfig}
          </div>
        )}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
