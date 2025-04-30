import React, { useState } from 'react';
import { Trash } from 'lucide-react';

const DeleteButton = ({ item, sendRemoveSingleItem}) => {
    const [deleteButtonHover, setDeleteButtonHover] = useState(false);

    return (
        <button
            onClick={() => sendRemoveSingleItem(item)}
            onMouseEnter={() => setDeleteButtonHover(true)}
            onMouseLeave={() => setDeleteButtonHover(false)}
        >
            {deleteButtonHover ? <Trash color='red' className='h-5 w-5 scale-125' /> : <Trash color="black" className='h-5 w-5' />}
        </button>
    );
}

export default DeleteButton;