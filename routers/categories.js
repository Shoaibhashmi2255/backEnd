const {Category} = require("../models/category");
const express = require("express");
const router = express.Router();



router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.send(categoryList);
});

router.get('/:id', async (req,res) => {
    const category = await Category.findById({_id: req.params.id})
    if (!category) {
        res.status(500).json({message: 'The Category woth the given id was not found'});
    };
    res.status(200).send(category);
});


router.post('/', async (req,res,next) =>{
    let category = new Category({
        Name : req.body.Name,
        id : req.body.id,
        image : req.body.image,
        icon : req.body.icon
    });
    category = await category.save();

    if(!category){
        return res.status(404).send('Category not found!')
    };
    res.send(category);
});


router.put('/:id', async (req,res) => {
    const category = await Category.findByIdAndUpdate(
        {_id:req.params.id},
        {
            Name: req.body.Name,
            icon: req.body.icon,
            image:req.body.image
        },
        {new:true}
    );
    if(!category){
        return res.status(500).send('Category not found!')
    };
    res.send(category);
})


router.delete('/:id' ,(req,res)=>{
    Category.findOneAndDelete({_id : req.params.id}).then(category => {
        if(category){
            return res.status(200).json({success: true, message : 'Category is deleted'});
        }else{
            return res.status(404).json({success:false, message:'Category is not deleted'});
        };
    }).catch(err => {
        return res.status(404).json({success:false, error : err});
    });
});


module.exports = router;