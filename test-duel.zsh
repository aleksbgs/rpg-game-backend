#!/bin/zsh

# Token unlimited duration
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YzA5NzAwNS1mMzAzLTRiNDYtOTI4Zi0wYWE5MjRhZmNkNmMiLCJyb2xlIjoiR2FtZU1hc3RlciIsInVzZXJuYW1lIjoiZ3Jlcm1yciAiLCJpYXQiOjE3NDE1MTE3MzEsImV4cCI6NDg5NzI3MTczMX0.hdCXX-A9dBOa3Ov_-p3C3IIjrZzIKoj49lW0DvHdl1c"
CHALLENGER_ID="5c097005-f303-4b46-928f-0aa924afcd6c"
OPPONENT_ID="5c097005-f303-4b46-928f-0aa924afcd6c"
NOATTACK=30

# 1. Create Duel
echo "Creating duel..."
curl -X POST "http://localhost:3003/api/challenge" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"opponentId\": \"$OPPONENT_ID\"}"

# 2. Get Challenger Stats
echo -e "\n\nGetting challenger stats..."
curl -X GET "http://localhost:3002/api/mycharacter/$CHALLENGER_ID" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"

# 3. Get Opponent Stats
echo -e "\n\nGetting opponent stats..."
curl -X GET "http://localhost:3002/api/mycharacter/$OPPONENT_ID" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"

# 4. Perform Attack
echo -e "\n\nPerforming attack..."
curl -X POST "http://localhost:3003/api/$NOATTACK/attack" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"

# 5. Verify Opponent Health
echo -e "\n\nVerifying opponent health after attack..."
curl -X GET "http://localhost:3002/api/mycharacter/$OPPONENT_ID" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"

# 6. Cast Spell
echo -e "\n\nCasting spell..."
sleep 2
curl -X POST "http://localhost:3003/api/$NOATTACK/cast" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"

# 7. Heal
echo -e "\n\nHealing..."
sleep 2
curl -X POST "http://localhost:3003/api/$NOATTACK/heal" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"

# 8. Finish Duel (Repeat Attack Until Over)
echo -e "\n\nAttacking until duel ends..."
for i in {1..3}
do
  curl -X POST "http://localhost:3003/api/$NOATTACK/attack" \
       -H "Authorization: Bearer $TOKEN" \
       -H "Content-Type: application/json"
  sleep 1  # Respect cooldown
done

# 9. Verify Item Transfer
echo -e "\n\nVerifying item transfer to winner..."
curl -X GET "http://localhost:3002/api/mycharacter/$CHALLENGER_ID" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json"