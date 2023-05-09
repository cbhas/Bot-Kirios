
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const { Client } = require('pg')

const obtenerEstado = async () => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "kiriosprueba",
        password: "Sc-11057",
        port: 5432
    })

    await client.connect()
    let opcion = "select * from consultas"
    const res = await client.query(opcion)
    const result = res.rows
    await client.end()

    return result
}

const obtenerOfertas = async () => {
    const client = new Client({
        user: "postgres",
        host: "localhost",
        database: "kiriosprueba",
        password: "Sc-11057",
        port: 5432
    })

    await client.connect()
    let opcion = "select * from ofertas"
    const res = await client.query(opcion)
    const result = res.rows
    await client.end()

    return result
}

const flujoCatalogo = addKeyword("1")
    .addAnswer("Revisa todo nuestro catálogo en el siguiente enlace: https://kinetshop.com/")
    .addAnswer("Digita *SI*, para regresar al menú principal")

const flujoConsultar = addKeyword("2")
    .addAnswer("*Ingresa el número de orden: 🔍*",
        {
            capture: true
        },
        async (ctx, { flowDynamic }) => {
            obtenerEstado().then((result) => {
                let resultado = ""
                for (let i = 0; i < result.length; i++) {
                    if (ctx.body.toString().toUpperCase() === result[i].orden) {
                        resultado = `Hola, *${result[i].nombre}*, tu equipo está ${result[i].estado}.`
                        break
                    } else {
                        resultado = `Lo sentimos, el número de orden: *${ctx.body.toUpperCase()}*, no se encuentra registrado`
                    }
                }
                flowDynamic([{ body: resultado }])
            })
        }
    )

const flujoInformacion = addKeyword("3")
    .addAnswer("En el siguiente enlace → https://www.kinetpos.com/ podras obtener toda la información que necesitas sobre KinetPOS.")
    .addAnswer("Digita *SI*, para regresar al menú principal")

const flujoHorario = addKeyword("4")
    .addAnswer("Horario de Atención ⏳\n*Lunes* a *Viernes* → 9:00 – 13:00, 15:00 – 19:00\n*Sabado* → 9:00 – 13:00\n*Domingo* → Cerrado")
    .addAnswer("Digita *SI*, para regresar al menú principal")

const flujoOferta = addKeyword("5")
    .addAnswer("Estos son los productos en oferta... 👀\n",
        null,
        (ctx, { flowDynamic }) => {
            obtenerOfertas().then((result) => {
                let tabla = ""
                for (let i = 0; i < result.length; i++) {
                    tabla += `${result[i].producto}\n\t\t a tan solo *${result[i].precio}*\n\t\t\t Link del producto *→* ${result[i].linkproducto}`;
                    if (i !== result.length - 1) {
                        tabla += "\n"
                    }
                }
                flowDynamic([{ body: tabla }])
            })
        }
    )
    .addAnswer("Digita *SI*, para regresar al menú principal", {
        delay: 1000
    })

const flujoRedes = addKeyword("6")
    .addAnswer("Estas son nuestras redes sociales: 📡\n*Instagram*:\n\thttps://www.instagram.com/kiriosnet/?hl=es\n*Facebook*:\n\thttps://www.facebook.com/kiriosnet/?locale=es_LA\n*LinkedIn:*\n\thttps://ec.linkedin.com/company/kiriosnet\n*TikTok*\n\thttps://www.tiktok.com/@kirios.ec")
    .addAnswer("Digita *SI*, para regresar al menú principal")

const flujoSalir = addKeyword("7")
    .addAnswer("Hasta pronto.. 👋")

const flujoSi = addKeyword("si")
    .addAnswer("Digita:\n\t*1* - Consultar catálogo 📑\n\t*2* - Verificar estado de mi equipo 📟\n\t*3* - Información sobre KinetPOS 📰\n\t*4* - Horario de atención ⏳\n\t*5* - Productos en oferta 💰\n\t*6* - Redes sociales 📡\n\t*7* - Salir 🫡", {
    }, null, [flujoCatalogo, flujoConsultar, flujoInformacion, flujoHorario, flujoOferta, flujoRedes, flujoSalir])

const flujoSaludo = addKeyword(EVENTS.WELCOME)
    .addAnswer('¡Bienvenid@ a *KIRIOS!* 👋\n_Somos Soluciones_ 💻\nSoy *Kiri* el asistente virtual de Kirios 🤖', {
        media: 'https://i.imgur.com/CSPINPo.png'
    })
    .addAnswer("Digita:\n\t*1* - Consultar catálogo 📑\n\t*2* - Verificar estado de mi equipo 📟\n\t*3* - Información sobre KinetPOS 📰\n\t*4* - Horario de atención ⏳\n\t*5* - Productos en oferta 💰\n\t*6* - Redes sociales 📡\n\t*7* - Salir 🫡", {
        delay: 1000
    }, null, [flujoCatalogo, flujoConsultar, flujoInformacion, flujoHorario, flujoOferta, flujoRedes, flujoSalir])

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flujoSaludo, flujoSi])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
