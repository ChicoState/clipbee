import React, { useEffect, useState } from 'react';
import { Clipboard} from 'lucide-react';
import {useNavigate } from 'react-router-dom';


const Start = () => {
    const navigate = useNavigate();

  return (
    <div className="h-auto w-[300px] bg-white shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center justify-between max-w-1/2">
            <Clipboard className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold">Clipbee</h3>
          </div>
          <button
            onClick={()=>navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Login
          </button>
          <button
            onClick = {()=>navigate('/newAccount')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}
export default Start;
