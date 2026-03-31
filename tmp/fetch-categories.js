const fetchCategories = async () => {
    try {
        const response = await fetch('http://localhost/wordpress/wordpress-backend/frontend/wp-json/wp/v2/categories');
        if (!response.ok) {
            throw new Error('Could not fetch categories: ' + response.statusText);
        }
        const data = await response.json();
        console.log('--- Product Categories ---');
        data.forEach(cat => {
            console.log(`ID: ${cat.id} | Name: ${cat.name} | Slug: ${cat.slug} | Count: ${cat.count}`);
        });
        console.log('--- End of Categories ---');
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        console.log('Check if your WordPress server is running at http://localhost/wordpress/wordpress-backend/frontend/');
    }
};

fetchCategories();
