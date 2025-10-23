<img width="1920" height="960" alt="ruana-mediaflix-GITHUB-COVER-SITELOGO-1920x960" src="https://github.com/user-attachments/assets/aa7b7d27-a96f-499d-a8f4-3e8b92ac6ed6" />

# Ruana MediaFlix · Java + Spring Boot · REST API + Frontend
![CI](https://github.com/RuanaRamos/mediaflix/actions/workflows/ci.yml/badge.svg)

> **Für Recruiter (60 Sek.):** Kleine, klare **REST-API** (Serien → Staffeln → Episoden) + minimales **Frontend**.  
> Fokus: **saubere Endpunkte, DTOs, Repositories, Fehlerbehandlung**.  
> **Direkt zum Code:** [Controller](https://github.com/RuanaRamos/mediaflix/tree/main/src/main/java/br/com/ruana/mediaflix/controller) · [Service](https://github.com/RuanaRamos/mediaflix/tree/main/src/main/java/br/com/ruana/mediaflix/service) · [Repository](https://github.com/RuanaRamos/mediaflix/tree/main/src/main/java/br/com/ruana/mediaflix/repository) · [DTO](https://github.com/RuanaRamos/mediaflix/tree/main/src/main/java/br/com/ruana/mediaflix/dto) · [Model/Entity](https://github.com/RuanaRamos/mediaflix/tree/main/src/main/java/br/com/ruana/mediaflix/model)

<p align="left">
  <img alt="Java" src="https://img.shields.io/badge/Java-21-blue">
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-API-green">
  <img alt="JPA/Hibernate" src="https://img.shields.io/badge/JPA-Hibernate-blue">
  <img alt="DB" src="https://img.shields.io/badge/DB-PostgreSQL-lightgrey">
  <img alt="Frontend" src="https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-informational">
</p>

## ✨ Features
- Serien auflisten + Details  
- Staffeln & Episoden pro Serie  
- „Neu“ & „Top 5“ (Demo-Daten)  
- Optional: OMDb/IMDb (API-Key)

## 🧰 Tech-Stack
**Backend:** Java 21, Spring Boot (Web, JPA), **PostgreSQL**, Flyway  
**Frontend:** HTML, CSS, Vanilla JS (Fetch API)  
**Build:** Maven · **Swagger/OpenAPI** (optional)

---

## 🧩 Backend

**Start (Maven)**
```bash
./mvnw spring-boot:run
# läuft unter: http://localhost:8080
```

---

---

## 🖥️ Frontend (HTML/CSS/JS)

**Code:** [`/frontend`](./frontend)

**Lokal starten**
```
# Direkt im Browser öffnen
frontend/index.html

# ODER kleinen Dev-Server starten
npx http-server frontend -p 5500
# → http://localhost:5500



## 📚 API (Back-End REST)

| Methode | Endpoint                 | Beschreibung                      |
|:------:|---------------------------|-----------------------------------|
| GET    | `/series`                 | Alle Serien auflisten             |
| GET    | `/series/{id}`            | Details zu einer Serie            |
| GET    | `/series/{id}/seasons`    | Staffeln einer Serie              |
| GET    | `/seasons/{id}/episodes`  | Episoden einer Staffel            |
| GET    | `/top5`                   | Top 5 (Demo)                      |
| GET    | `/releases`               | Neuerscheinungen (Demo)           |

**Beispiel-Response**
```json
{ "id": 1, "title": "Game of Swords", "seasons": 3, "rating": 8.7 }

## 🛠️ Troubleshooting

- **CORS:** Frontend (5500) + Backend (8080) ⇒ habilite CORS **ou** sirva o front via 8080.
- **Flyway:** confirme nomes `V1__*.sql`, `V2__*.sql`, etc.
- **Null-Daten im Frontend:** use `fetch('/...')` quando front e back estiverem na mesma origem.
- **CI:** o workflow compila com **Java 21** e **pula testes**.  
  Para rodar testes no CI com Postgres, use **Testcontainers** ou suba um serviço Postgres no Actions.

✅ Roadmap
 Suche + Filter (Genre/Jahr)

 Loading/Empty/Error-Zustände im Frontend

 Docker Compose (App + Postgres)

 OMDb-Integration (Timeout/Retry)

🤝 Beiträge
PRs willkommen (Fork → Branch → PR).

📄 Lizenz
MIT
