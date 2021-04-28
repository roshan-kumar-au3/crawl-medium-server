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
    const searchTag = req.query.tag.replace(/\s+/g, '-').toLowerCase();
    const page = parseInt(req.query.page);
    console.log({ page })
    console.log({ searchTag });
    const mediumUrl = `https://medium.com/topic/${searchTag}`;
          request(mediumUrl, (error, response, html) => {
            if (response.statusCode == 200) {
                const $ = cheerio.load(html);
                let crawlData = [];
                const blogSection = $('section.n');
                blogSection.each((i, el) => {
                  const desc = $(el).find('div.gj.s').children('h3').text() == '' ? $(el).find('h3.bh.bk').children('a').first().text() : $(el).find('div.gj.s').children('h3').text() ;
                    const crawlObj = {
                        link:  $(el).find('a').attr('href'),
                        description: desc,
                        readInfo: $(el).find('div.n.cr').text(),
                    }
                    if (crawlObj.link.startsWith('/')) {
                        crawlObj.link = `https://medium.com${crawlObj.link}`
                    }
                    request(crawlObj.link, (error, response, html) => {
                      if (!error && response.statusCode == 200) {
                        const $ = cheerio.load(html);
                        const title = $('h1').text();
                        const authorInfo = ($('a').children('p').first('.ba.bd').text() === '' ? $('span').children('a').first('.fd.fh').text() : $('a').children('p').first('.ba.bd').text() );
                        crawlObj.title = title;
                        crawlObj.author = authorInfo;
                        // crawlData.push(crawlObj);
                        // console.log(crawlData);
                        const tagsArray = [];
                        const tags = $('a.b');
                        tags.each((tagIndex, tagElem) => {
                            const tagText = $(tagElem).text();
                            let tagLinks = $(tagElem).attr('href');
                            if (tagLinks.startsWith('/')) {
                              tagLinks = `https://medium.com${tagLinks}`
                            }
                            if (tagText !== "Follow" && tagText !== "Get started" && tagText !== "Read more from Better Marketing") {
                              tagsArray.push({ tagName: tagText, tagLink: tagLinks });   
                            }
                        })
                        crawlObj.tags = tagsArray;
                        crawlData.push(crawlObj);
                        
                        if (isNaN(page) || page === 1) {
                          if (crawlData.length === 10) {
                            return  res.status(200).json({
                                  message: 'success',
                                  crawlData
                              });
                          } 
                        }
                        if (page > 1) {
                          if (crawlData.length === page * 10) {
                            const blogIndex = (page - 1) * 10;
                            const lastBlogPosition = page * 10;
                            return  res.status(200).json({
                              message: 'success',
                              crawlData: crawlData.slice(blogIndex, lastBlogPosition),
                            });
                          }
                        }
                      }
                    });
                });
            }
            if (response.statusCode != 200) {
                const word = req.query.tag.toLowerCase().replace(/-/g, ' ')
                request(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`, (error, response, body) => {
                  console.log('body', body);
                  console.log('response', response.statusCode);
                  if(response.statusCode == 200) {
                          return res.status(400).json({
                            error: 'Not able to scrape, topic not found on medium',
                            similarWordsData: JSON.parse(body),
                        });
                  }
                  if(response.statusCode != 200) {
                            return res.status(400).json({
                              error: 'Not able to scrape, topic not found on medium',
                          })
                  }
                  console.log('error', error);
                })
            }
        });
}


module.exports = { crawlMediumMiddleware, crawlMedium  };