const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    try {
        res.redirect(302, './index.html');
    }
    catch (e) {
        res.status(500).send("Error");
    };
});


app.use(express.static('statics'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

