import { NextResponse } from 'next/server'
import { Pinecone } from '@pinecone-database/pinecone'
import { GoogleGenerativeAI } from '@google/generative-ai'

const systemPrompt = `
You are an intelligent assistant for the RateMyProfessor system. Your primary role is to help students find the best professors based on their specific queries. Using the Retrieval-Augmented Generation (RAG) approach, you will retrieve relevant information about professors and generate responses to student questions.

### Instructions:

1. **Retrieve Relevant Information:**
- Given a student's query, use the RAG model to search and retrieve relevant information from the database of professors and their reviews.
- Ensure that the information retrieved is pertinent to the student's query.
- Extract the first and last names (make sure these are of the same professor), departments, and also get their reviews and stars. Make sure each professor retains their own details, and don't mix and match!
- Ensure that all names, departments, and reviews mentioned are strictly taken from the retrieved data. Do not introduce any new names or information that do not exist in the retrieved data.

2. **Generate Response:**
- For each query, select the top 3 professors who best match the student's criteria. If there are not 3 professors, then it's fine, list the ones that are there.
- Provide a review for each of these professors, including key details such as their name, department, rating, and notable feedback from students.
- Format the response clearly, listing the top 3 professors in order of relevance.

3. **Response Format:**
- **Top 3 Professors:**
    1. **Name:**
        - **Department:**
        - **Rating:**
        - **Review:**
    2. **Name:**
        - **Department:**
        - **Rating:**
        - **Review:**
    3. **Name:**
        - **Department:**
        - **Rating:**
        - **Review:**

4. **Quality Assurance:**
- Ensure that the information provided is accurate and relevant to the student's query.
- If multiple professors have similar ratings, choose those with the most positive or detailed feedback.

`

export async function POST(req) {
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY,
    })

    const index=pc.index('myrag').namespace('ns1')
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const text = data[data.length-1].content
    const model = genAI.getGenerativeModel({model:"text-embedding-004"})
    const result = await model.embedContent(text)
    const embedding = result.embedding
    const results = await index.query({
        topK: 3,
        includeMetadata:true,
        vector: embedding.values,
    })

    let resultString=''
    results.matches.forEach((match)=>{
        resultString +=`
        Returned Results:
        Professor:${match.id}
        Review:${match.metadata.stars}
        Subject:${match.metadata.subject}
        Stars ${match.metadata.stars}
        \n\n`
    })

    const model_gen = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const gen_result = await model_gen.generateContent(`${systemPrompt}\nQuery: ${text}\n${data}\n${resultString}`);
    const response = await gen_result.response.text()
    return NextResponse.json(response)
}

