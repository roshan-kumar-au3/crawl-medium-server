const cheerio = require('cheerio');
const request = require('request');
const SearchHistory = require('../models/searchhistory');


const crawlMediumMiddleware = (req, res, next) => {
    console.log(req.query.tag);
    const tags = [];
    if (req.query.tag) {
    tags.push(req.query.tag);
    const searchData = new SearchHistory({
        admin_id: req.profile.id,
        tags: tags,
    });
    SearchHistory.findOne({
        where: {
          admin_id: req.profile.id
        }
      })
        .then(history => {
          if (!history) {
            searchData
              .save()
              .then(saved => {
                if (!saved) {
                  return res.status(400).json({
                      error: "Not able to save"
                  });
                } 
                console.log(saved)
              })
              .catch(err => console.log(err));
          } else {
            console.log('history', history)
            const newTags = new Set([...history.tags, req.query.tag])
            history.update(
              {
                admin_id: req.profile.id,
                tags: Array.from(newTags)
              },
              { where: { admin_id: req.profile.id } }
            )
              .then(updated => {
                if (!updated) {
                  return res.status(400).json({
                      error: "Not able to update"
                  });
                }
                console.log(updated);
              })
              .catch(err => console.log(err));
          }
        })
        .catch(err => console.log(err));
    next();
    } else {
        return res.status(400).json({
            error: "Not able to crawl"
        });
    }
};

const crawlMedium = (req, res) => {
    const searchTag = req.query.tag.toLowerCase().replace(/\s+/g, '-');
    const mediumUrl = `https://medium.com/topic/${searchTag}`;
    try {
          request( mediumUrl, (error, response, html) => {
            if (!error && response.statusCode == 200) {
                const $ = cheerio.load(html);
                let crawlData = [];
                const blogSection = $('section > div > section');
                blogSection.each((i, el) => {
                    const descriptionData = $(el).children().first().text();
                    const crawlObj = {
                        link:  $(el).find('a').attr('href'),
                        description:  $(el).find('a').text().substr(0, descriptionData.length - 1),
                        author: descriptionData.substr(descriptionData.length - 44, descriptionData.length - 17),
                        readInfo: descriptionData.substr(descriptionData.length - 17, descriptionData.length)
                    }
                    if (crawlObj.link.startsWith('/')) {
                        crawlObj.link = `https://medium.com${crawlObj.link}`
                    }
                    request(crawlObj.link, (error, response, html) => {
                      if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        const title = $('h1').text();
                        let author = $('a').children('p').first().text();
                        console.log("author", author)
                        crawlObj.title = title;
                        crawlObj.description = descriptionData.substr(title.length, descriptionData.length - 1)
                        crawlObj.author = author;
                        if (crawlObj.title) {
                            crawlData.push(crawlObj);
                            console.log(crawlObj);                   
                        }
                        // console.log('crawl dataaaaaaa', crawlData)
                        // res.write(crawlData);
                        if (crawlData.length === 5) {
                          return  res.status(200).json({
                                message: 'success',
                                crawlData
                            });
                        }
                      }
                    });
                });
            }
            if (!html) {
              return res.status(400).json({
                error: 'No blog found with the the given topic'
            })
            }
            if (error) {
                return res.status(400).json({
                    error: 'Not able to scrape'
                })
            }
        });
    } catch (error) {
      return res.status(400).json({
        error: 'No blog found with the the given topic'
      })
    }
}


module.exports = { crawlMediumMiddleware, crawlMedium  };