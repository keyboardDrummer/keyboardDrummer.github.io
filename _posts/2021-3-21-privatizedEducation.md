---
layout: post
title: Privatized free education
---

Governments around the world often provide free education. The benefit of doing this is huge, and one of expressing it is in terms of government finances. Since education improves people's income, it enables the government to collect more taxes and reduces the social welfare they have to distribute.

Many governments organise the free education they provide themselves. A common argument against state-operated organisations is that they're supposedly not effective at reaching their goal. How are government operated educational systems doing in that regard? Let's look at some data. Here's a poll to collect the opinions of you and your follow readers.

<iframe class="qp_iframe" src="https://www.poll-maker.com/frame3521929xF9DC897B-106" seamless="seamless" frameborder="no" style="border:0; background:transparent; width:100%; height:539px;"></iframe><div id='qp_foot3521929' style='width:100%; padding:5px; text-align:center;'>Created with <a href='https://www.poll-maker.com/'>Poll Maker</a></div><STYLE>@media (max-width:320px) {.qp_iframe{min-height:683px}}@media (max-width:375px) {.qp_iframe{min-height:611px}}@media (max-width:414px) {.qp_iframe{min-height:611px}}</STYLE>

The above poll shows that few of us think our education was optimal. Of course, it's easy to criticise and maybe our education was actually better than we think.

In the media, we can also find numerous issues with eductional as is. In the Netherlands, there are primary school teacher shortages so vast that primary school classes can reach over 50 students. Sometimes schools let people teach that have not yet started their teacher's education, because the schools have no other teachers. Another concern is that only 15% of primary school teachers are male.

# Solution
Privatizing free education can be done by letting the government sell a 'right to educate' contract that's tied to a specific person. Whomever owns the contract is paid a percentage of that person's earnings each year. Owning such a contract thus means you're incentivised to help that person get a great career, which you can do by educating them.

There are a number of problems with the above approach that we need to address:
- How do we ensure students are educated equally?
- How do we provide education that's unrelated to prospective income?
- How do we balance the needs of government, parents and student?
- How do we handle an education provider not meeting expectations?
- How do we ensure education providers are paid fairly?

<!--
- How do we prevent education providers from making too much profit?
- How can we gradually move to this system?
-->

## How do we ensure students are educated equally?
It's important that students, after leaving the educational system, are at a similar level of capability. Educational equality improves income equality and reduces the need for social welfare.

When it comes to equality in education, we can consider three different extremes:
- Equal: we try to let each student reach the same level
- Fair: we put the same effort into educating each student
- Greedy: we teach students as long as the increased income outweighs the cost of teaching. This means fast learners are educated for longer, more intensely and with a higher quality than slow learners.

The Dutch educational system is a mix of equal, fair and greedy. It's mostly fair in the sense that most students will get a similar amount of education, with similar class sizes and their teachers receive similar salaries. However, it's also greedy since fast learners are taught slightly longer in the Dutch system. Fast learners generally end their high school at 18 years of age while slower learners end it at age 16. The system is equal in the sense that students who struggle a bit, but not too much, can stay in the same level they were before, but simply take longer to finish it. Such a student will fail to pass a certain year of school and be forced to do that year over. A student who fails a year twice however must go to a lower track, which is 'fair'.
 
When using educational contracts to privatise education, a linear contract, where the layout is linearly coupled to the student's income, leeds to a greedy system. An equal system is created by giving a flat payout as long as the student is above a certain minimum income. Such a system would mean fast learners get the shortest education, since their education stops when they come within that minimum income. It's not possibe to set the contract payout in such as way that it leads to a 'fair' system, but we believe that a fair system is not a diserable goal, only equal and greedy outcomes are. We therefore suggest combining both the greedy and equal system:

{% highlight haskell %}
payout income = greedy * greedyPart + (1 - greedy) * equalPart
where 
    greedyPart = factor * income
    equalPart = if (income > threshold) flatPayout else 0
{% endhighlight %}

To prevent fraud, the following invariant must hold:

`tax(threshold) - tax(0) > payout(threshold)`

Which we can rewrite to:

`tax(threshold) + social_welfare > payout(threshold)`

Given this invariant, no money can be made by an education provider giving a student a fake job where the student doesn't need to work but returns part of their salary back to the education provider who then also receives the payout from the government who doesn't realise the job is fake.

We want to keep the `threshold` as low as possible, since education providers are likely only interested in educating people who can meet this threshold. Students who are unlikely able to meet this threshold will have eductional contracts with negative value, meaning the government will pay education providers to educate these people. The above invariant limits how low the threshold can be set. 

<!-- insert example income vs payout curve -->

## How do we provide education that's unrelated to prospective income?
Education providers may differ in factors that don't necessarily relate to improved income, factors such as:
- Physical, cultural and religious education
- Flexible education, the ability for students to choose what job they want to do.
- Student happiness, how much students enjoy their education

Such factors can be included as part of the educational contract. The contract can specify how much time the student much be educated in each of those topics, and possibly what the outcome should be. If a contract holder does not meet these criteria they can be concidered in breach and be forced to sell the contract. We later establish a mechanism for forced sale of a contract.

<!-- Education providers may choose to force a person into a career that while high paying, doesn't make them happy. -->

## How do we balance the needs of government, parents and student?
How do we decide to which education provider to sell a student's education contract? The government, the parents and the students themself are all stakeholders.

We propose that the government first filters the offerings of education providers, after which, depending on the student being of a minimal age, either the parents or the student must select one from the remaining list. 
The government will likely filter out education providers that it does not trust to optimally use the contract, or that is fears might breach the contract.

Education providers may offer more or less money to buy a contract, and in the case of a student with a learning disability may even ask for money to 'buy' the contract. The government may ask parents or student to provide some compensation when choosing education providers that only offer a small amount for a contract, however we expect the government to also provide some more expensive education providers for free, to give parents and students some freedom of choice even when they don't income to spare.

## How do we handle an education provider not meeting expectations?
What if an education provider is "undereducating" the child, not educating them well enough to get the most out of the right to educate.

Educational contracts are periodically appraised. The government will estimate how much the student will earn throughout their lifetime, and together with its estimations of costs to educate, will determine how much it thinks the right to educate the student is currently worth.

Right to educate contracts have a cancellation clause which can be invoked if the parents or the government are unhappy with an education provider, which likely happens if they think the provider is under-educating the child.

## How do we ensure education providers are paid fairly?
Educating a person is an extremely risky and long term investment. It's possible that no private investors are willing to do this. Education contracts should be tradeable, so that one provider can sell a contract to another provider. This way, an education contract holder can make a profit simply by increasing the expected income of the student, without actually getting any direct payout from the contract.

To jumpstart the education contract trading market, the government should act as a buyer of education contracts, after which it will try to sell the contract again. If there's no buyer for the contract, the student will roll into a government provided educational system.

<!--
payout(income) = greediness * greedy + (1 - greediness) * equal
where 
    greedy = factor * income
    equal = if (income > threshold) flatPayout else 0

average_lifetime_income

contract_value = lifetime_payout(person) - education_cost(person)

contract_value should be positive for people expected to meet the threshold, so
lifetime_payout(person) > education_cost(person)

lifetime_payout(person) = greediness * greedy + (1 - greediness) * equal
where 
    greedy = factor * lifetime_income
    equal = if (lifetime_income > lifetime_threshold) lifetime_flat else 0

lifetime_payout(person) = greediness * factor * lifetime_income + (1 - greediness) * lifetime_flat

greediness * factor * lifetime_income + (1 - greediness) * lifetime_flat > education_cost

-->
### Emmigration
What happens if a student decides to move to another country, where they won't pay taxes to the country where they were educated, and it may not be possible to track their income? Will the holder of the 'right to educate' contract be left without a payout? In this case the government will make an estimate of what would have been paid out for that person per year, and pay that out on a yearly basis. If the person happens to immigrate back, the normal payment based on their income will continue.

<!--
Are there weird side-effects because contract holders might benefit from people leaving or staying in the country? Will they contact people and offer them money for saying or leaving?
-->




