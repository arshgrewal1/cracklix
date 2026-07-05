'use client';

import React, { useMemo } from "react";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Trophy, Star, ChevronRight, GraduationCap, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import { SuccessStory } from "@/types";

export default function SuccessStoriesPreview() {
  const db = useFirestore();

  const storiesQuery = useMemo(
    () =>
      db
        ? query(
            collection(db, "success_stories"),
            orderBy("createdAt", "desc"),
            limit(3)
          )
        : null,
    [db]
  );

  const { data: stories, loading } = useCollection<SuccessStory>(
    storiesQuery as any
  );

  if (!loading && (!stories || stories.length === 0)) return null;

  return (
    <section className="py-12 md:py-24 bg-slate-50/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-16">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
            <Trophy className="h-5 w-5 md:h-6 md:w-6" />
          </div>
          <h2 className="text-2xl md:text-5xl font-black text-[#0F172A] tracking-tight">
            Success Stories
          </h2>
          <p className="text-slate-500 font-medium text-sm md:text-lg max-w-xl mx-auto">
            Real aspirants who cracked their dream exams with Cracklix
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-80 w-full rounded-[2rem] bg-white"
                />
              ))
            : stories?.map((story) => (
                <Card
                  key={story.id}
                  className="border border-slate-100 shadow-xl rounded-[2rem] bg-white p-6 md:p-8 flex flex-col group hover:shadow-2xl transition-all overflow-hidden"
                >
                  <div className="flex items-center gap-4 mb-5">
                    <div className="h-14 w-14 rounded-2xl overflow-hidden bg-[#0F172A] shrink-0 relative">
                      {story.imageUrl ? (
                        <Image
                          src={story.imageUrl}
                          fill
                          alt={story.name}
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-white font-black text-xl">
                          {story.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-[#0F172A] text-sm truncate">
                        {story.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <GraduationCap className="h-3 w-3 text-primary" />
                        <span className="truncate">
                          {story.exam}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-600 border-none px-2 py-0.5 font-black text-[8px] ml-auto shrink-0 shadow-sm">
                      {story.rank}
                    </Badge>
                  </div>

                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>

                  <div className="flex-1">
                    <Quote className="h-5 w-5 text-primary/20 mb-1" />
                    <p className="text-sm md:text-base text-slate-600 italic leading-relaxed line-clamp-4">
                      &quot;{story.quote}&quot;
                    </p>
                  </div>

                  <p className="text-[10px] font-bold text-slate-300 mt-4">
                    Batch {story.year}
                  </p>
                </Card>
              ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 rounded-full font-bold text-sm border-2 border-slate-200 hover:border-primary/30 hover:bg-slate-50 transition-all active:scale-95 text-[#0F172A] gap-2"
          >
            <Link href="/success-stories">
              View All Stories <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
