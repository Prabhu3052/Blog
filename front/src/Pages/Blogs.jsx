import React, { useEffect, useState } from 'react';
import blogService from '../api/blog';
import BlogCard from '../Components/BlogCard';
import LoadSpinner from '../Components/Loadspinner';
import './Styles/Blogs.css';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);

  // Your original mock data
  const mockBlogs = [
    {
      id: 1,
      title: "Mastering React in 30 Days",
      excerpt: "Start your React journey with this step-by-step guide to mastering concepts...",
      author: "John Doe",
      createdAt: new Date("2023-08-10"),
      image: "https://source.unsplash.com/featured/?reactjs",
      likes: 24,
      comments: 3
    },
    {
        id: 2,
        title: "Node.js Best Practices",
        excerpt: "Avoid these common mistakes and write better backend code using Node.js...",
        author: "Jane Smith",
        createdAt: new Date("2023-07-22"),
        image: "https://source.unsplash.com/featured/?nodejs,backend",
        likes: 18,
        comments: 2
      },
      {
        id: 3,
        title: "UI/UX Design Principles",
        excerpt: "Design stunning interfaces by understanding the core principles of UX design...",
        author: "Alex Gray",
        createdAt: new Date("2023-09-14"),
        image: "https://source.unsplash.com/featured/?uxdesign,interface",
        likes: 32,
        comments: 4
      },
      {
        id: 4,
        title: "10 Tips for Clean JavaScript Code",
        excerpt: "Keep your JS code neat, efficient, and error-free with these 10 tips...",
        author: "Linda Ray",
        createdAt: new Date("2023-08-01"),
        image: "https://source.unsplash.com/featured/?javascript,code",
        likes: 15,
        comments: 1
      },
      {
        id: 5,
        title: "Why You Should Learn TypeScript",
        excerpt: "TypeScript is taking over JavaScript – here’s why you should start learning it now...",
        author: "Tom Hanks",
        createdAt: new Date("2023-07-05"),
        image: "https://source.unsplash.com/featured/?typescript,developer",
        likes: 22,
        comments: 2
      },
      {
        id: 6,
        title: "Mobile App Development in 2024",
        excerpt: "The latest frameworks and trends in mobile app development for this year...",
        author: "Nina Gomez",
        createdAt: new Date("2023-06-19"),
        image: "https://source.unsplash.com/featured/?mobileapp,flutter",
        likes: 28,
        comments: 6
      },
      {
        id: 7,
        title: "Build a Portfolio That Stands Out",
        excerpt: "Tips to build a developer portfolio that catches recruiters' eyes...",
        author: "Kevin Lee",
        createdAt: new Date("2023-08-30"),
        image: "https://source.unsplash.com/featured/?portfolio,developer",
        likes: 37,
        comments: 9
      },
      {
        id: 8,
        title: "Exploring AI in Web Development",
        excerpt: "How AI tools are transforming the way we build websites...",
        author: "Sarah Johnson",
        createdAt: new Date("2023-07-15"),
        image: "https://source.unsplash.com/featured/?ai,webdevelopment",
        likes: 45,
        comments: 7
      },
      {
        id: 9,
        title: "Building a Scalable API with Express.js",
        excerpt: "Learn how to build a scalable API using Express.js and MongoDB...",
        author: "Alice Brown",
        createdAt: new Date("2023-07-01"),
        image: "https://source.unsplash.com/featured/?api,expressjs",
        likes: 29,
        comments: 5
      },
      {
        id: 10,
        title: "Mastering CSS Grid Layout",
        excerpt: "Design responsive layouts using CSS Grid with this comprehensive guide...",
        author: "Chris White",
        createdAt: new Date("2023-09-02"),
        image: "https://source.unsplash.com/featured/?css,grid",
        likes: 19,
        comments: 4
      },
      {
        id: 11,
        title: "GraphQL vs REST API",
        excerpt: "When to use GraphQL and when to use REST for your web applications...",
        author: "Olivia Green",
        createdAt: new Date("2023-07-20"),
        image: "https://source.unsplash.com/featured/?graphql,restapi",
        likes: 33,
        comments: 6
      },
      {
        id: 12,
        title: "Building Serverless Applications",
        excerpt: "Get started with serverless computing and build your first serverless app...",
        author: "David Black",
        createdAt: new Date("2023-06-25"),
        image: "https://source.unsplash.com/featured/?serverless,cloud",
        likes: 21,
        comments: 2
      },
      {
        id: 13,
        title: "Introduction to Cloud Computing",
        excerpt: "Learn the basics of cloud computing and how it is changing the IT landscape...",
        author: "Sophia Blue",
        createdAt: new Date("2023-08-12"),
        image: "https://source.unsplash.com/featured/?cloudcomputing,cloud",
        likes: 26,
        comments: 4
      },
      {
        id: 14,
        title: "Blockchain Technology Explained",
        excerpt: "A deep dive into blockchain technology and its real-world applications...",
        author: "Daniel Green",
        createdAt: new Date("2023-09-01"),
        image: "https://source.unsplash.com/featured/?blockchain,technology",
        likes: 38,
        comments: 8
      },
      {
        id: 15,
        title: "Introduction to Cybersecurity",
        excerpt: "Protect your applications and data by understanding the fundamentals of cybersecurity...",
        author: "Emma White",
        createdAt: new Date("2023-06-30"),
        image: "https://source.unsplash.com/featured/?cybersecurity,security",
        likes: 30,
        comments: 5
      },
      {
        id: 16,
        title: "Learning Docker and Kubernetes",
        excerpt: "Streamline your DevOps workflow with Docker and Kubernetes...",
        author: "Luke Harris",
        createdAt: new Date("2023-08-05"),
        image: "https://source.unsplash.com/featured/?docker,kubernetes",
        likes: 40,
        comments: 10
      },
      {
        id: 17,
        title: "Web Accessibility Best Practices",
        excerpt: "Ensure your web apps are accessible to everyone with these best practices...",
        author: "Jackie Brown",
        createdAt: new Date("2023-07-25"),
        image: "https://source.unsplash.com/featured/?webaccessibility,webdev",
        likes: 25,
        comments: 3
      },
      {
        id: 18,
        title: "DevOps: From Beginner to Pro",
        excerpt: "Master DevOps and automate your development pipeline with this guide...",
        author: "Michael Blue",
        createdAt: new Date("2023-08-17"),
        image: "https://source.unsplash.com/featured/?devops,automation",
        likes: 35,
        comments: 7
      },
      {
        id: 19,
        title: "Introduction to WebAssembly",
        excerpt: "Speed up your web applications with WebAssembly and improve performance...",
        author: "Ella Gray",
        createdAt: new Date("2023-09-08"),
        image: "https://source.unsplash.com/featured/?webassembly,performance",
        likes: 23,
        comments: 4
      },
      {
        id: 20,
        title: "Next.js for Static Site Generation",
        excerpt: "Learn how to build static websites with Next.js and improve SEO...",
        author: "Liam Brown",
        createdAt: new Date("2023-07-10"),
        image: "https://source.unsplash.com/featured/?nextjs,static",
        likes: 27,
        comments: 6
      },
      {
        id: 21,
        title: "Real-Time Web Applications with WebSockets",
        excerpt: "Learn how to build real-time web apps using WebSockets and Node.js...",
        author: "Ava Smith",
        createdAt: new Date("2023-08-14"),
        image: "https://source.unsplash.com/featured/?websockets,real-time",
        likes: 39,
        comments: 8
      },
      {
        id: 22,
        title: "Getting Started with Tailwind CSS",
        excerpt: "Learn how to quickly build beautiful, responsive websites with Tailwind CSS...",
        author: "Grace Green",
        createdAt: new Date("2023-06-28"),
        image: "https://source.unsplash.com/featured/?tailwindcss,css",
        likes: 31,
        comments: 5
      },
      {
        id: 23,
        title: "How to Build a Chat Application",
        excerpt: "Build your own real-time chat app using Node.js, Express, and WebSockets...",
        author: "Henry Johnson",
        createdAt: new Date("2023-07-11"),
        image: "https://source.unsplash.com/featured/?chatapp,communication",
        likes: 28,
        comments: 4
      },
      {
        id: 24,
        title: "The Future of Quantum Computing",
        excerpt: "Understand the concepts behind quantum computing and its future in technology...",
        author: "Oliver Clark",
        createdAt: new Date("2023-08-09"),
        image: "https://source.unsplash.com/featured/?quantumcomputing,technology",
        likes: 45,
        comments: 9
      },
      {
        id: 25,
        title: "Building Progressive Web Apps (PWAs)",
        excerpt: "Learn how to build offline-first, fast, and reliable Progressive Web Apps...",
        author: "Zoe Lee",
        createdAt: new Date("2023-06-15"),
        image: "https://source.unsplash.com/featured/?pwa,webapp",
        likes: 29,
        comments: 6
      },
      {
        id: 26,
        title: "Learning Python for Data Science",
        excerpt: "Get started with Python and explore its power for data analysis and machine learning...",
        author: "Benjamin Harris",
        createdAt: new Date("2023-07-18"),
        image: "https://source.unsplash.com/featured/?python,datamining",
        likes: 30,
        comments: 5
      },
      {
        id: 27,
        title: "AI-Powered Chatbots: Build Your Own",
        excerpt: "Create an AI chatbot with NLP and integrate it into your website or app...",
        author: "Sophia Williams",
        createdAt: new Date("2023-08-20"),
        image: "https://source.unsplash.com/featured/?ai,chatbots",
        likes: 32,
        comments: 7
      },
      {
        id: 28,
        title: "Creating Stunning Animations with CSS",
        excerpt: "Master CSS animations and create stunning effects for your web pages...",
        author: "William Scott",
        createdAt: new Date("2023-09-05"),
        image: "https://source.unsplash.com/featured/?css,animations",
        likes: 21,
        comments: 4
      },
      {
        id: 29,
        title: "Getting Started with Machine Learning",
        excerpt: "Learn the basics of machine learning and start your journey into AI...",
        author: "Jack Turner",
        createdAt: new Date("2023-06-22"),
        image: "https://source.unsplash.com/featured/?machinelearning,ai",
        likes: 38,
        comments: 6
      },
    {
      id: 30,
      title: "Creating RESTful APIs with Node.js",
      excerpt: "Learn how to build RESTful APIs with Node.js and Express.js for your projects...",
      author: "Lily White",
      createdAt: new Date("2023-08-13"),
      image: "https://source.unsplash.com/featured/?restapi,nodejs",
      likes: 27,
      comments: 3
    }
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await blogService.getAllBlogs();
        
        if (data && data.length > 0) {
          // Use real data from API
          const formattedBlogs = data.map(blog => ({
            id: blog._id,
            title: blog.title,
            excerpt: blog.content.substring(0, 100) + '...',
            author: blog.author,
            createdAt: new Date(blog.createdAt),
            image: blog.image || 'https://source.unsplash.com/featured/?coding,technology',
            likes: blog.likes || 0,
            comments: blog.comments?.length || 0
          }));
          setBlogs(formattedBlogs);
        } else {
          // Fall back to mock data if API returns empty
          setBlogs(mockBlogs);
          setUsingMockData(true);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        // Use mock data if API fails
        setBlogs(mockBlogs);
        setUsingMockData(true);
        setError('Could not connect to server. Showing sample data.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) return <LoadSpinner />;

  return (
    <div className="blogs-page">
      <h2 className="blogs-heading">Latest Blogs</h2>
      {usingMockData && (
        <div className="mock-data-warning">
          Note: Currently displaying sample data
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <div className="blogs-grid">
        {blogs.map(blog => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}