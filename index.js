import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
const appID = '1e1fd24d';
const appKey = 'aa5f3909d2c25849c60996e3ee6c5008';
let searchTerm='';
let data='';
let page=1;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');

app.get('/', async (req,res)=>{
  let totalPages;
  res.render('index.ejs',{
  result:[], 
  searchTerm:'',
  page:page,
  total:0,
  totalPages:0
  });
});

app.post('/results/page/1', async (req,res)=>{
  searchTerm = req.body.search.trim();
  if (searchTerm.length > 0){
    const URL = buildSearchURL(searchTerm, page);
    console.log('url:',URL);
    try{  
      let result = await axios.get(URL);      
      let totalResults = result.data.count;
      let totalPages = Math.ceil(totalResults/20);
      res.render('index.ejs',{
        result: result.data.results, 
        searchTerm:searchTerm,
        page:page,
        total: totalResults,
        totalPages: totalPages
      }); 
    }catch(err){
      console.error('error:',err.message);
      res.status(500).send('internal server error');
    }
  }else {
    res.redirect('/');
  }
});

app.get('/results/page/:pageNumber',async(req,res)=>{
  let nextPage = parseInt(req.params.pageNumber) || 1;
  console.log('page:', nextPage);
  if(nextPage > 0){    
    const URL = buildSearchURL(searchTerm, nextPage);
    try{  
      let result = await axios.get(URL);
      let totalResults = result.data.count;
      let totalPages = Math.ceil(totalResults/20);
      res.render('index.ejs',{
        result: result.data.results,
        searchTerm:searchTerm,
        page:nextPage,
        total: totalResults,
        totalPages: totalPages
      }); 
    }catch(err){
      console.error('error:',err.message);
      res.status(500).send('internal server error');
    }  
  
  }else{
    res.status(400).send('invalid page param');
  }
});

function buildSearchURL(term,page){
  return `http://api.adzuna.com/v1/api/jobs/us/search/${page}?app_id=${appID}&app_key=${appKey}&results_per_page=20&what=${searchTerm}&content-type=application/json`;
}

app.listen(3000,()=>{
  console.log(`server running on port ${port}`);
});
