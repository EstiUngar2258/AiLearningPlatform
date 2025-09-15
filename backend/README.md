# Backend quick start

Steps to connect this backend to MongoDB Atlas and seed sample data.

1. Create `backend/.env` with the following content (replace `<password>`):

```
MONGO_URI=mongodb+srv://esti0534162258_db_user:<password>@cluster0.gi4ldmg.mongodb.net/AI_Learning?retryWrites=true&w=majority
PORT=5000
```

2. Make sure your IP is authorized in Atlas (Network Access).

3. Install dependencies (if not done):

```
cd backend
npm install
```

4. Run the server (dev):

```
npm run dev
```

5. Seed sample data (this will insert demo users):

```
npm run seed
```

6. Verify in Atlas (Collections) or via API:

```
# GET users
Invoke-RestMethod -Method Get -Uri 'http://localhost:5000/api/users'
```
