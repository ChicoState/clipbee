import { Clipboard } from "lucide-react";
import React from "react";


const Header = () => {
    return (
        <div className="flex items-center justify-between max-w-1/2">
            <Clipboard className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold">Clipbee</h3>
        </div>
    )

}
export default Header;