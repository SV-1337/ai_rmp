'use client'
import './globals.css'; 
import { Box, Button, Stack, TextField, Typography, Paper} from '@mui/material'
import { useState } from 'react'
import Markdown from 'react-markdown'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async() => {
    setMessages((messages) => [ ...messages, { role: 'user', content: message } ])
    setMessage('')

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify([ ...messages, { role: 'user', content: message } ])
    })

    const data = await response.json()
    setMessages((messages) => {
          return [
            ...messages,
            { role: 'assistant', content: data},
          ]
    })
  }

  return (
    
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        backgroundImage: `url(${require('./images/background.jpg')})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Paper elevation={3} sx={{ width: 600, height: 700, p: 3, borderRadius: 4, bgcolor: '#f8edd2' }}>
        <Stack
          direction={'column'}
          spacing={2}
          height="100%"
        >
          <Typography variant="h5" color="#191500" textAlign="center">
            Rate My Professor Chatbot
          </Typography>
          <Stack
            direction={'column'}
            spacing={2}
            flexGrow={1}
            overflow="auto"
            sx={{ maxHeight: "100%", p: 1, bgcolor: '#f0dba6', borderRadius: 2 }}
          >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#665600 '
                    : '#b39700 '
                }
                color="white"
                borderRadius={16}
                p={3}
                maxWidth="75%"
              >
               <Markdown>{message.content}</Markdown>
              </Box>

            </Box>
            
          ))}

        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{ bgcolor: '#f4e4bc', borderRadius: 2, input: { color: 'black' }, label: { color: 'gray' } }}
          />
          <Button variant="contained" color="primary" onClick={sendMessage} sx={{ borderRadius: 2 }}>
            Send
          </Button>
        </Stack>
      </Stack>
      </Paper>
    </Box>
  );
}