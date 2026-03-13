import React from 'react';
import { Navigate } from 'react-router-dom';

// This file is deprecated and effectively removed from the application flow.
// Redirecting to the new pricing dashboard just in case someone tries to access it directly.
const AdminConfiguracoes = () => {
    console.log("[AdminConfiguracoes] This page is deprecated. Redirecting...");
    return <Navigate to="/admin/precos-carros" replace />;
};

export default AdminConfiguracoes;