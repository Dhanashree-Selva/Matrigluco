import { apiClient, API_BASE_URL, getStoredToken } from "./client";

export const chatbotApi = {
    async createConversation(title = "Maternal Health Consultation") {
        const response = await apiClient.post("/chatbot/conversations", { title });
        return response.data;
    },

    async listConversations() {
        const response = await apiClient.get("/chatbot/conversations");
        return response.data;
    },

    async getConversation(conversationId) {
        const response = await apiClient.get(`/chatbot/conversations/${conversationId}`);
        return response.data;
    },

    async updateConversation(conversationId, payload) {
        const response = await apiClient.patch(`/chatbot/conversations/${conversationId}`, payload);
        return response.data;
    },

    async deleteConversation(conversationId) {
        const response = await apiClient.delete(`/chatbot/conversations/${conversationId}`);
        return response.data;
    },

    async getMessages(conversationId) {
        const response = await apiClient.get(`/chatbot/conversations/${conversationId}/messages`);
        return response.data;
    },

    async sendMessage(conversationId, content) {
        const response = await apiClient.post(`/chatbot/conversations/${conversationId}/messages`, {
            content,
        });
        return response.data;
    },

    async streamMessage(conversationId, content, onToken, onDone, onError) {
        const token = getStoredToken();
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/conversations/${conversationId}/stream`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ content }),
            });

            if (!response.ok) {
                throw new Error(`Streaming failed: HTTP ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n\n");
                buffer = lines.pop(); // keep last incomplete chunk

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        const data = line.slice(6);
                        if (data === "[DONE]") {
                            if (onDone) onDone();
                            return;
                        }
                        if (data.startsWith("[ERROR:")) {
                            if (onError) onError(new Error(data));
                            return;
                        }
                        if (onToken) onToken(data);
                    }
                }
            }
            if (onDone) onDone();
        } catch (err) {
            if (onError) onError(err);
            else console.error("Chat stream error:", err);
        }
    },

    async submitFeedback(messageId, rating, comment = null) {
        const response = await apiClient.post(`/chatbot/messages/${messageId}/feedback`, {
            rating,
            comment,
        });
        return response.data;
    },
};
