"use client";

import React from "react";
import BasketInspectorModal from "./BasketInspectorModal";
import UPISimulationModal from "./UPISimulationModal";
import OracleModal from "./OracleModal";
import AuthModal from "./AuthModal";

export default function ModalsContainer() {
  return (
    <>
      <BasketInspectorModal />
      <UPISimulationModal />
      <OracleModal />
      <AuthModal />
    </>
  );
}
