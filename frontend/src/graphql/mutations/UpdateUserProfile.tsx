import React, { useState } from 'react';

const UpdateProfileForm: React.FC = () => {
    const [fullname, setFullname] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [chatroomId, setChatroomId] = useState<number | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!selectedFile) return; // Verifica se o arquivo foi selecionado

        try {
            const formData = new FormData();
            formData.append('fullname', fullname);
            formData.append('file', selectedFile);
            if (chatroomId) {
                formData.append('chatroomId', chatroomId.toString());
            }

            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar perfil');
            }

            console.log("Perfil atualizado com sucesso");
            // Lógica adicional após o upload

        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Full Name"
                required
            />
            <input
                type="file"
                onChange={(e) => {
                    if (e.target.files) {
                        setSelectedFile(e.target.files[0]);
                    }
                }}
                required
            />
            <input
                type="number"
                value={chatroomId || ''}
                onChange={(e) => setChatroomId(Number(e.target.value))}
                placeholder="Chatroom ID"
            />
            <button type="submit">Update Profile</button>
        </form>
    );
};

export default UpdateProfileForm;
