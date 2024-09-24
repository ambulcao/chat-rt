import React, { useState } from 'react';
import { gql, useApolloClient } from "@apollo/client";

export const UPDATE_PROFILE = gql`
    mutation UpdateProfile(
        $fullname: String!
        $file: String
        $chatroomId: Float
    ) {
        updateProfile(fullname: $fullname, file: $file, chatroomId: $chatroomId) {
            id
            fullname
            avatarUrl
        }    
    }
`;

const UpdateProfileForm: React.FC = () => {
    const [fullname, setFullname] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [chatroomId, setChatroomId] = useState<number | null>(null);
    const client = useApolloClient(); // Importa o cliente Apollo

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

            // Execute a mutação
            await client.mutate({
                mutation: UPDATE_PROFILE,
                variables: {
                    fullname,
                    file: selectedFile, // Passa o arquivo diretamente
                    chatroomId,
                },
            });

            // Aqui você pode adicionar lógica para notificar o sucesso, limpar o formulário, etc.

        } catch (error) {
            console.error("Error updating profile:", error);
            // Lidar com o erro (exibir mensagem, etc.)
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
