import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import SidePanel from './side_panel/SidePanel.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <SidePanel />
    </StrictMode>,
)