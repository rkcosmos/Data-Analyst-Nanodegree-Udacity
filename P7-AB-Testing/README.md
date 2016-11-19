# A/B Testing Report

**By:** Rakpong Kittinaradorn

**Date:** 19 November 2016


## Experiment Design

#### Metric Choice

>List which metrics you will use as invariant metrics and evaluation metrics here.

>For each metric, explain both why you did or did not use it as an invariant metric and why you did or did not use it as an evaluation metric. Also, state what results you will look for in your evaluation metrics in order to launch the experiment.

**Invariant Metric:** Number of cookies, number of clicks, Click-through-probability

Number of cookies is the number of unique users who see the homepage. It is also the unit of conversion in this experiment. Since the experiment happen after the count of cookies, number of cookies should be held constant across the experiment.

Number of clicks is the number of unique users who click “start free trial”. This should also be invariant for the same reason as number of cookies.

Click-through-probability is the ratio of above two number. Since both is an invariant, the ratio should also be an invariant. This invariant metric is added as a double sanity check.

**Evaluation Metric:** Gross conversion, Net conversion

Gross conversion is the ratio of user who enroll in free trial versus number of user who click “start free trial”. Net conversion is the ratio of user who pay at least once versus number of user who click “start free trial”. Both ratio will be affected when we run the experiment and their changes are the key factors in determining whether to launch new feature or not.

Retention is also a good candidate for an evaluation metric but it requires too much time to run the experiment. Thus it is excluded in this experiment.

User-IDs are generated when users enroll in free trial period. Number of user-IDs is not included in evaluation metrics because it contain the same information as gross conversion. Since all user have to click "start free trial" before enrollments.

If the new free trial screener is efficient, I expect gross conversion to be lower
because student will not start free trial program if they do not feel ready.
On another hand, in order to enhance user experience without sacrificing financial benefit net conversion should not decrease.

#### Measuring Standard Deviation

>List the standard deviation of each of your evaluation metrics.

>For each of your evaluation metrics,
indicate whether you think the analytic estimate would be comparable to the the empirical variability, or whether you expect them to be different (in which case it might be worth doing an empirical estimate if there is time). Briefly give your reasoning in each case.

In this section, I will calculate standard deviation of evaluation metric based on baseline data.

data|value
--- | ---
Unique cookies to view page per day | 40000
Unique cookies to click "Start free trial" per day | 3200
Enrollments per day| 660
Click-through-probability on "Start free trial"| 0.08
Probability of enrolling, given click| 0.20625
Probability of payment, given enroll| 0.53
Probability of payment, given click| 0.1093125

Standard error calculation (for 5000 cookies):
```python
sqrt(p*(1-p)/N)
```

```
Gross conversion: se = sqrt(0.20625*(1-0.20625)/(5000*0.08))
Net conversion: se = sqrt(0.1093125*(1-0.1093125)/(5000*0.08))
```
Results:

> Gross conversion: 0.0202

> Net Conversion: 0.0156

Both analytical estimations should be comparable to empirical variations because the denominator (unit of analysis) of both is the number of cookies(pageview) which is the same as the unit of division. I would not suggest doing empirical study if budget is tight.

#### Sizing

###### Number of Samples vs. Power

>Indicate whether you will use the Bonferroni correction during your analysis phase, and give the number of pageviews you will need to power you experiment appropriately.

I’m not going to use Bonferroni correction since we only have two evaluation metric to consider. In addition, two evaluation metrics are not independent to each other. Using Bonferroni correction will make the estimation too conservative.

With alpha = 0.05 and beta = 0.2, baseline probability for gross conversion = 20.625%. Minimum detectable effect (d) = 1%. Number of click needed for gross conversion = 25,314x2. (see http://www.evanmiller.org/ab-testing/sample-size.html). Factor 2 is because we need both control and experiment group. Number of pageview needed for gross conversion = (25,314x2)/0.08 = 632850.

Number of pageview for net conversion can be calculated in the same manner with baseline probability = 10.93125% and d = 0.75%, the result is 685325.

In order to test both metrics, the minimum pageview for this experiment is 685385.

###### Duration vs. Exposure

>Indicate what fraction of traffic you would divert to this experiment and, given this, how many days you would need to run the experiment.
>Give your reasoning for the fraction you chose to divert. How risky do you think this experiment would be for Udacity?

In case Udacity does not have other experiment to run in the same time. I recommend running this experiment with full traffic to get the result as fast as possible. We need 18 days for this experiment. The experiment do not harm students in anyway, we just provide additional warning which they can also ignore if they do not agree. The experiment only correct data about hoe dedicated student expect to be. This is not sensitive data therefore I consider this harmless and low risk experiment. The risk will be further minimize by complete it in short amount of time in order to reduce possible confusing from student asking each other whether one see the new feature or not.

## Experiment Analysis
#### Sanity Checks
>For each of your invariant metrics, give the 95% confidence interval for the value you expect to observe, the actual observed value, and whether the metric passes your sanity check. (These should be the answers from the "Sanity Checks" quiz.)

**Number of cookies:** The observed value is calculated from number of pageview in control group/Total number of pageview. The result is 0.50064. Standard error can be caluculated analytically by assuming binomial distribution.

```python
Standard error: se = sqrt(p(1-p)/N)
```

where p = 0.5 and N = total number of pageview in this case. The resulting confident interval is (0.49882, 0.50118). The observed value falls in the confident interval so I **pass** this sanity check.

**Number of clicks on "Start free trial":** The calculation is the same as above. The confident interval is (0.49588, 50412). The observed value is 0.50047. I **pass** this sanity check.

**Click-through-probability on "Start free trial":** Here I will consider the difference
in click-through-probability between control and experiment group. The observed value is [click in experiment]/[pageview in experiment] - [click in control]/[pageview in control].

The standard error is calculated from pooled varience:

```
p_pool = "total click"/"total pageview"

se_pool = sqrt(p_pool(1-p_pool)/(1/"pageview in control" + 1/"pageview in experiment"))
```

The resulting confidence interval is (-0.001296, 0.001296). The observed value 0.000057 falls into the interval. I then **pass** this sanity check.

#### Result Analysis

###### Effect Size Tests

>For each of your evaluation metrics, give a 95% confidence interval around the difference between the experiment and control groups. Indicate whether each metric is statistically and practically significant.

The calculation of 95% confidence interval is done by using pooled standard error.

**Gross conversion:** Confident interval = (-0.0291, -0.0120). The confident interval lies outside 0 and less than practical limit at 1%, so it is both **statistical** and **practical** significant.

**Net conversion:** Confident interval = (-0.0116, 0.0019). The result is **insignificant** both in term of statistics and practicality. However the confident interval also went down below practical limit (-0.0075) which means there is some risks here for the profit to decrease.


###### Sign Tests

>For each of your evaluation metrics, do a sign test using the day-by-day data, and report the p-value of the sign test and whether the result is statistically significant.

**Gross conversion:** p-value = 0.0026. It is less than 0.05, so I conclude it is **statistically significant**.

**Net conversion:** p-value = 0.6776. This is clearly **not significant**.

###### Summary

>State whether you used the Bonferroni correction, and explain why or why not. If there are any discrepancies between the effect size hypothesis tests and the sign tests, describe the discrepancy and why you think it arose.

I’m not going to use Bonferroni correction because two evaluation metrics are not independent to each other. Using Bonferroni correction would be too conservative in this experiment. In addition, to reduce false possible(type I error) of the recommendation. I will recommend the new feature when *both* evaluation metrics match our expectation. Moreover we also do sign test as an additional safe net for false positive.

The hypothesis tests and sign tests agree with each other so we can proceed in the recommendation with confident.


#### Recommendation

>Make a recommendation and briefly describe your reasoning.

The experiment clearly show improve of user experience with the new feature both statistically and practically. There is some risk of declining profit though since confidence interval of net conversion cover the nagative area of practical limit. So I conclude it is a **judgement call** for the decision/policy maker. If they can accept small risk of decreasing profit in exchange to customer experience, then launch the change. Else if the financial situation is at its edge, I recommend keeping the old setting.


## Follow-Up Experiment

>Give a high-level description of the follow up experiment you would run, what your hypothesis would be, what metrics you would want to measure, what your unit of diversion would be, and your reasoning for these choices.

In this Data analyst nanodegree, there is an optional project at the beginning. It is a short project that should be doable in free trial period if the student have enough background. We could use that project as a criteria for recommending student to proceed in payment service. That is if student finish project in time, we recommend them to go on. Else we recommend them to take prerequisite course first. Unit of diversion will be enrolled student. The evaluation metric will be number of student who finished the degree divided by number of student who pay at least one month.
