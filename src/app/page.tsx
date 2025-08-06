import type React from "react";
import { auth0 } from "../lib/auth0";
import { redirect } from "next/navigation";

const Home: React.FC = async () => {
  const session = await auth0.getSession();

  if (session && session.user) {
    redirect("/dashboard");
  }
  return (
    <div>
      <section className="grid lg:grid-cols-12 mx-auto px-4 py-8 max-w-screen-xl lg:py-16">
        <div className="lg:col-span-7 place-self-center mr-auto">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl">
            Instantly Generate Dream Rooms
            <span className="text-center purple_gradient"> Using AI </span>
            {/* <br className="md:hidden" /> */}
            with
            <span className="text-center purple_gradient"> RedesAIn</span>.
          </h1>
          <p className="hero_desc">
            Upload your photo, choose the style and watch how our AI matches you to 40 custom made designs.
            <strong> Reimagine Any Interior, Exterior or Garden using AI.</strong>
          </p>
          <button type="button" className="mt-8 black_btn">
            Redesign Now
          </button>
        </div>
        <div className="lg:col-span-5 relative h-[500px]">{/* <Image src="/images/image1.png" alt="Generated Room" fill className="object-cover rounded-lg" /> */}</div>
      </section>
      <section className="">
        <div className="text-center max-w-3xl mb-4 text-3xl font-extrabold tracking-tight md:text-4xl mx-auto">AI-powered Landscaping & Patio Design</div>
        <div className="mt-5 text-lg text-center font-light text-gray-500 max-w-4xl md:text-lg mx-auto">
          AI automatically re-designs exterior spaces and patios, taking into account architectural elements such as lawns, backyards, pools and outdoors furniture/appliances - from benches to BBQ
          setups.
        </div>
        <div className="mt-8 px-4 py-8 max-w-screen-xl grid grid-cols-9 gap-4 w-full mx-auto">
          <div className="col-span-4">
            <div className="h-64 sm:h-96 w-full aspect-video bg-gray-100 relative">{/* <Image src="/images/image2.png" alt="Landscape Design" fill className="object-cover rounded-lg" /> */}</div>
          </div>
          <div className="col-span-1">
            <div className="h-64 sm:h-96 w-full flex justify-center items-center">
              {/* <Image src="/images/arrow.png" alt="Landscape Design" className="object-cover rounded-lg" width={30} height={30} /> */}
            </div>
          </div>
          <div className="col-span-4">
            <div className="h-64 sm:h-96 w-full aspect-video bg-gray-100 relative">{/* <Image src="/images/image3.png" alt="Landscape Design" fill className="object-cover rounded-lg" /> */}</div>
          </div>
        </div>
      </section>
      <section className="max-w-screen-xl mx-auto mt-20">
        <div>
          <h1 className="text-center max-w-3xl mb-4 text-3xl font-extrabold tracking-tight md:text-4xl mx-auto">Loved by Many Worldwide</h1>
          <p className="mt-5 text-lg text-center font-light text-gray-500 max-w-4xl md:text-lg mx-auto">3217+ People can't be wrong. Let AI do the magic for you.</p>
        </div>
        <div className="mt-8 px-4 py-8 max-w-screen-xl grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 w-full mx-auto">
          <div className="col-span-1 md:col-span-4 border-2 border-gray-200 px-4 py-6 rounded-lg text-center">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="text-black w-12 h-12 mb-3 inline-block" viewBox="0 0 24 24">
              <path d="M8 17l4 4 4-4m-4-5v9"></path>
              <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29"></path>
            </svg>

            <h2 className="title-font font-medium text-3xl text-gray-900">2.9k</h2>
            <p className="leading-relaxed">Downloads</p>
          </div>
          {/*  */}
          <div className="col-span-1 md:col-span-4 border-2 border-gray-200 px-4 rounded-lg py-6  text-center">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="text-black w-12 h-12 mb-3 inline-block" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"></path>
            </svg>

            <h2 className="title-font font-medium text-3xl text-gray-900">3.3k </h2>
            <p className="leading-relaxed">Users</p>
          </div>
          {/*  */}
          <div className="col-span-1 md:col-span-4 border-2 border-gray-200 px-4 py-6 rounded-lg text-center">
            <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="text-black w-12 h-12 mb-3 inline-block" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>

            <h2 className="title-font font-medium text-3xl text-gray-900">40.6k</h2>
            <p className="leading-relaxed">Photos</p>
          </div>
        </div>
      </section>
      <section>
        <div>
          <h1 className="text-center max-w-3xl mb-4 text-3xl font-extrabold tracking-tight md:text-4xl mx-auto">Testimonials</h1>
          <div className="mt-8 px-4 py-8 max-w-screen-xl grid  grid-cols-1 md:grid-cols-12 gap-8 w-full mx-auto">
            <div className="col-span-6 w-full ">
              <div className="h-full bg-gray-100 p-8 rounded-md">
                <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="block w-5 h-5 text-gray-400 mb-4" viewBox="0 0 975.036 974.036">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <p className="leading-relaxed mb-6">"I use RedesAIn AI to help my clients visualize how their backyard could look like if they hire me for the job. It works flawlessly"</p>
                <a className="inline-flex items-center">
                  <span className="flex-grow flex flex-col">
                    <span className="title-font font-medium text-gray-900">Holden Caulfield</span>
                    <span className="text-gray-500 text-sm">UI Developer</span>
                  </span>
                </a>
              </div>
            </div>
            <div className="col-span-6 w-full">
              <div className="h-full bg-gray-100 p-8 rounded-md">
                <svg fill="currentColor" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="block w-5 h-5 text-gray-400 mb-4" viewBox="0 0 975.036 974.036">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <p className="leading-relaxed mb-6">
                  "I needed to replace my living room furniture so I generated a few design ideas with RedesAIn AI. I picked my favorite, sent it to the furniture make and now I have it in real life.
                  Awesome technology!"
                </p>
                <a className="inline-flex items-center">
                  <span className="flex-grow flex flex-col">
                    <span className="title-font font-medium text-gray-900">Alper Kamu</span>
                    <span className="text-gray-500 text-sm">Designer</span>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
