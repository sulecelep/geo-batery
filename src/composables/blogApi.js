import { api } from 'src/boot/axios';


export function useBlogApi() {
// Blogları çek
  function getAllBlogs() {
  return  api.get('/Blog/get-all-blog');
}

 // Blog ekleme
function addBlog(blog) {
    console.log('blog', blog)
    // blog = { title: string, content: string }
    // Backend /Blog/add-blog endpoint'i form veya json bekliyorsa ona göre düzenle
    return api.post("/Blog/add-blog", blog);
  };
   return {
    getAllBlogs,
    addBlog,
  };
}