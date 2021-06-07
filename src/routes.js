const express = require("express"); // biblioteca para criar o servidor
const routes = express.Router(); // cria a rotas do caminho



const Profile = {
    data: {
        name: "Fabio",
        avatar: "https://avatars.githubusercontent.com/u/66393999?v=4",
        "monthly-budget": 3000,
        "days-per-week": 5,
        "hours-per-day": 5,
        "vacation-per-year": 4,
        "value-hour": 75
    },

    controllers:{
        index(req, res) {
            return res.render("profile", { profile: Profile.data }) 
        },
        update(req, res){
            // req.body para pegar os dados
            const data = req.body

            // definir quantas semanas tem em um ano
            const weekksPerYear = 52
            //remover as semanas de férias do ano, para pegar quantas semanas tem em 1 mês
            const weeksPerMonth = (weekksPerYear - data["vacation-per-year"]) / 12
            
            // total de horas trabalhadas na semana
            const weekTotalHours = data["hours-per-day"] * data["days-per-week"]

            // horas trabalhadas no mês
            const montlyTotalHours = weekTotalHours * weeksPerMonth

            // qual será o valor da minha hora?
            const valueHour = data["monthly-budget"] / montlyTotalHours

            Profile.data = {
                ...Profile.data,
                ...req.body,
                "value-hour": valueHour
            }

            return res.redirect('/profile')
        },
    }
};

const Job = {
    data: [
        {
            id: 1,
            name: "Pizzaria Guloso",
            "daily-hours": 2,
            "total-hours": 1,
            created_at: Date.now(),
        },
        {
            id: 2,
            name: "OneTwo Project",
            "daily-hours": 3,
            "total-hours": 47,
            created_at: Date.now(),
        },
    ],

    controllers: {
        index(req, res) {
            const updatedJobs = Job.data.map((job) => {
                // ajustes no job
                const remaining = Job.services.remainingDays(job);
                const status = remaining <= 0 ? "done" : "progress";

                return {
                    ...job,
                    remaining,
                    status,
                    budget: Job.services.calculateBudget(job, Profile.data["value-hour"])
                };
            });

            return res.render("index", { jobs: updatedJobs });
        },
        create(req, res) {
            return res.render("job")
        },

        save(req, res) {
            // req.body = {name: "", 'daily-hours': "", 'total-hours': ""}

            const lastId = Job.data[Job.data.length - 1]?.id || 0;

            Job.data.push({
                id: lastId + 1,
                name: req.body.name,
                "daily-hours": req.body["daily-hours"],
                "total-hours": req.body["total-hours"],
                created_at: Date.now(), // atribuindo data de hoje
            });
            return res.redirect("/");
        },

        show(req, res) {
            const jobId = req.params.id

            const job = Job.data.find(job => Number(job.id) === Number(jobId))

            if(!job){
                return res.send('Job not Found!')
            }

            job.budget = Job.services.calculateBudget(job, Profile.data["value-hour"])

            return res.render("job-edit", { job})
        },

        update(req, res){
            const jobId = req.params.id

            const job = Job.data.find(job => Number(job.id) === Number(jobId))

            if(!job){
                return res.send('Job not Found!')
            }

            const updateJob = {
                ...job,
                name: req.body.name,
                "total-hours": req.body["total-hours"],
                "daily-hours": req.body["daily-hours"],
            }

            Job.data = Job.data.map(job => {
                
                if(Number(job.id) === Number(jobId)){
                    job = updateJob
                }

                return job
            })

            res.redirect('/job/' + jobId)

        },
        
        delete(req,res){
            const jobId = req.params.id

            Job.data = Job.data.filter(job => Number(job.id) !== Number(jobId))
            
            return res.redirect('/')
        },
    },
    services: {
        remainingDays(job) {
            //Calculo de tempo restante
            const remainingDays = (job["total-hours"] / job["daily-hours"]).toFixed();

            const createdDate = new Date(job.created_at);
            const dueDay = createdDate.getDate() + Number(remainingDays);
            const dueDateInMS = createdDate.setDate(dueDay);

            // recebe em milisegundos
            const timeDiffInMs = dueDateInMS - Date.now();

            // transforma milisegundo em dias
            const dayInMS = 1000 * 60 * 60 * 24;
            const daiDiff = Math.floor(timeDiffInMs / dayInMS);

            // restam "x" dias
            return daiDiff;
        },
        calculateBudget: (job, valueHour) => valueHour * job["total-hours"]
    },
};

routes.get("/", Job.controllers.index);
routes.get("/job", Job.controllers.create);
routes.post("/job", Job.controllers.save);
routes.get("/job/:id", Job.controllers.show);
routes.post("/job/:id", Job.controllers.update);
routes.post("/job/delete/:id", Job.controllers.delete);
routes.get("/profile", Profile.controllers.index);
routes.post("/profile", Profile.controllers.update);

module.exports = routes;
