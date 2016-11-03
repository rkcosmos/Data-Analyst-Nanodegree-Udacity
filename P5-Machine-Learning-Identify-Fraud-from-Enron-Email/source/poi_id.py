#!/usr/bin/python

import sys
import pickle
import pandas as pd
import numpy as np
from time import time
from pprint import pprint
sys.path.append("tools/")

from feature_format import featureFormat, targetFeatureSplit
from tester import dump_classifier_and_data
from sklearn.feature_selection import SelectKBest

############### Task 1: Select what features you'll use. ###############

target = ['poi']

financial_features = ['salary', 
 'total_payments', 'loan_advances', 
 'bonus', 
 'deferred_income', 'total_stock_value', 
 'expenses', 'exercised_stock_options', 
 'other', 'long_term_incentive', 
 'restricted_stock', 'director_fees', 'restricted_stock_deferred', 'deferral_payments'
 ]
'''
financial_features = ['salary', 
 'total_payments', 'loan_advances', 
 'bonus', 
 'deferred_income', 'total_stock_value', 
 'expenses', 'exercised_stock_options', 
 'other', 'long_term_incentive', 
 'restricted_stock']
'''

email_features = ['to_messages',
 'from_poi_to_this_person', 'from_messages',
 'from_this_person_to_poi', 'shared_receipt_with_poi']

all_features = financial_features + email_features
features_list = target + all_features

### Load the dictionary containing the dataset
with open("final_project_dataset.pkl", "r") as data_file:
    data_dict = pickle.load(data_file)

############### Explore data

# make dataframe
df = pd.DataFrame.from_dict(data_dict,orient='index')
df = df.loc[:,features_list]
df = df.replace('NaN', np.nan)

# export data for preliminary exploration in Excel
dataFile = open('data.csv','w')
df.to_csv(path_or_buf=dataFile)

#print df.describe(include='all')
# see which feature has a lot of missing data
#print df.isnull().sum().sort_values(axis=0, ascending=False)
# see number of available data each person has
#print df.count(axis=1).sort_values(axis=0, ascending=True)
#print df['poi'].value_counts()

#################### Task 2: Remove outliers ###############

# remove 'TOTAL' because it is not a person
# remove 'LOCKHART EUGENE E' because he does not have any data apart from 'poi'
# remove 'THE TRAVEL AGENCY IN THE PARK ' because it is not a person. 

outlier_keys = ['TOTAL','LOCKHART EUGENE E','THE TRAVEL AGENCY IN THE PARK']
df =df.drop(outlier_keys)

#################### Task 3: Create new feature(s) ###############

df = df.replace(np.nan, 0.)
df['poi'] = df['poi']*1.0

#### K-best algorithm: use statistical inference to see the importance of each feature
def run_K_best(df,target,number):
    # df = dataframe, target is target column, number is #of feature to be used
    features = list(df.columns.values)
    features.remove(target)
    features_name = [target] + features
    
    k_best = SelectKBest(k=number)
    k_best.fit(df[features].as_matrix(), df[target].as_matrix())
    score = k_best.scores_
    score_chart = zip(features, score)
    score_chart_df = pd.DataFrame(score_chart, columns=['Feature', 'Score'])
    return score_chart_df.sort_values('Score', axis=0,ascending=False)

print run_K_best(df,'poi','all')

########## Feature Engineering ##########

#### as suggested in the class, I'll construct the ratio of poi message feature

df['ratio_poi_message'] = df['shared_receipt_with_poi']/(df['to_messages']+df['from_messages'])
df['ratio_to_poi'] = df['from_this_person_to_poi']/df['to_messages']
df['ratio_from_poi'] = df['from_poi_to_this_person']/df['from_messages']
df['ratio_bonus_salary'] = df['bonus']/df['salary']
df = df.replace(np.nan, 0.)

drop1_key =[
'to_messages',
'from_messages',
'shared_receipt_with_poi',
'from_this_person_to_poi',
'from_poi_to_this_person'
]
df.drop(drop1_key, axis=1,inplace = True)

########## Feature Selection #############
drop2_key = ['restricted_stock_deferred', 'deferral_payments','director_fees','ratio_from_poi',
'other','ratio_to_poi','expenses','loan_advances','total_payments','restricted_stock',
'ratio_poi_message','long_term_incentive','deferred_income','salary',
'bonus','total_stock_value','exercised_stock_options']
no_del_feature = 1

df.drop(drop2_key[0:no_del_feature], axis=1,inplace = True)
drop3_key = ['ratio_bonus_salary']
#df.drop(drop3_key, axis=1,inplace = True)
print "drop these features: ",drop2_key[0:no_del_feature]
print run_K_best(df,'poi','all')

column_name = list(df.columns.values)
column_name.remove('poi')

for name in column_name:
   df[name+'_squared'] = df[name]**2.0
   df[name+'_log'] = np.log(df[name]+1)
df = df.replace(np.nan, 0.)

#print run_K_best(df,'poi','all')

# Note that we now have 
# score 9.74 (ratio_poi_message) instead of 8.59 (shared_receipt_with_poi)
# score 5.12 (ratio_from_poi) instead of 5.24 (from_poi_to_this_person)
# score 4.09 (ratio_to_poi) instead of 2.38 (from_this_person_to_poi)
# and we throw away 2 low scores, 1.6(to_messages) and 0.17(from_messages) 

### Transform dataframe back to dictionary and Store to my_dataset for easy export below.
my_dataset = df.to_dict(orient="index")

############### Task 4: Try a variety of classifiers ###############

from sklearn.naive_bayes import GaussianNB
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import AdaBoostClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC, SVC
from sklearn.neighbors import KNeighborsClassifier

############### Task 5: Tune your classifier to achieve better than .3 precision and recall 

features_list = df.columns.tolist()
features_name = features_list[:]
features_name.remove('poi')
features_list = ['poi'] + features_name

############### Grid search

from sklearn.pipeline import Pipeline
from sklearn import preprocessing
from sklearn.preprocessing import MinMaxScaler
from sklearn.decomposition import PCA

std_scaler = preprocessing.StandardScaler(copy=True, with_mean=True, with_std=True)
minmax_scaler = preprocessing.MinMaxScaler()
scale = std_scaler
pca = PCA()


def searchparameter(clf_name, scoring, my_dataset, features_list):
    from sklearn.cross_validation import StratifiedShuffleSplit
    from sklearn import grid_search
    
    cv = StratifiedShuffleSplit(labels, n_iter=50, test_size=0.3, random_state = 42)
    t0 = time()
    
    KBparameters = {"Kbest__k":[30, 39, 41, 'all']}
    PCAparameters = {"PCA__n_components":[13, 14, 15, 16, 17], "PCA__whiten": [True, False]}
    #KBparameters = {"Kbest__k":[10 ,12, 'all']}
    #PCAparameters = {"PCA__n_components":[3, 6, 8, 10], "PCA__whiten": [False]}
       
    if clf_name == 'nb':
        NBparameters = {}
        parameters = dict(KBparameters.items() +PCAparameters.items() + NBparameters.items())
        base_clf = Pipeline(steps=[("Kbest", SelectKBest()),("scaler", scale), ("PCA", pca), ("NB", GaussianNB())])
    if clf_name == 'lr':
        LRparameters = {'LR__C':[10.**16, 10.**18, 10.**20],'LR__tol':[10**-17, 10**-15, 10**-12],'LR__class_weight':['balanced']}
        parameters = dict(KBparameters.items() + PCAparameters.items() + LRparameters.items())
        base_clf = Pipeline(steps=[("Kbest", SelectKBest()),("scaler", scale), ("PCA", pca), ("LR", LogisticRegression())])
    if clf_name == 'dt':
        DTparameters = {'DT__min_samples_split':[2, 7], 'DT__max_depth':[3,5,8],
                        'DT__class_weight':['balanced']}
        parameters = dict(PCAparameters.items() + DTparameters.items())
        base_clf = Pipeline(steps=[("scaler", scale), ("PCA", pca), ("DT", DecisionTreeClassifier())])
    if clf_name == 'ab':
        ABparameters = {'AB__base_estimator__min_samples_split':[2, 4, 6], 'AB__base_estimator__max_depth':[5,8]}
        parameters = dict(PCAparameters.items() + ABparameters.items())
        base_clf = Pipeline(steps=[("scaler", scale), ("PCA", pca), 
                    ("AB", AdaBoostClassifier(DecisionTreeClassifier()))])
    if clf_name == 'rf':
        RFparameters = {'RF__min_samples_split':[2, 4, 6], 'RF__max_depth':[3,6],
                        'RF__class_weight':['balanced'],'RF__warm_start':[True,False]}
        parameters = dict(PCAparameters.items() + RFparameters.items())
        base_clf = Pipeline(steps=[("scaler", scale), ("PCA", pca), ("RF", RandomForestClassifier())])
    if clf_name == 'sv':
        SVparameters = {'SV__kernel':['rbf','sigmoid'],'SV__C':[10.**10, 10.**15],'SV__class_weight':['balanced']}
        parameters = dict(PCAparameters.items() + SVparameters.items())
        base_clf  = Pipeline(steps=[("scaler", scale), ("PCA", pca), ("SV", SVC())])
    if clf_name == 'kn':
        KNparameters = {'KN__n_neighbors':[3, 4],'KN__weights':['distance'],
                        'KN__algorithm' : ['auto', 'ball_tree'],'KN__p': [1.1,2,3]}
        parameters = dict(PCAparameters.items() + KNparameters.items())                
        base_clf  = Pipeline(steps=[("scaler", scale), ("PCA", pca), ("KN",  KNeighborsClassifier())])
        
    clf = grid_search.GridSearchCV(base_clf ,parameters,scoring=scoring,cv=cv,verbose=1)
    clf.fit(features, labels)
    print("done in %0.3fs" % (time() - t0))
    print("Best estimator found by grid search:")
    print(clf.best_estimator_)
    print("Grid score:")
    pprint(clf.grid_scores_) 

data = featureFormat(my_dataset, features_list, sort_keys = True)
labels, features = targetFeatureSplit(data)

scorer = 'precision'
model = 'lr'
searchparameter(model, scorer, my_dataset, features_list)
print 'model: ',model, ', scorer: ',scorer


############### Task 6: Dump your classifier, dataset, and features_list 

pca_lr = PCA(n_components = 15, whiten = False)
final_lr = LogisticRegression(C=10.**18, tol=10.**-15, class_weight="balanced")
pipe_lr = Pipeline(steps=[("scaler", scale), ("PCA", pca_lr), ("LR", final_lr)])

clf = pipe_lr

### so anyone can check your results. You do not need to change anything below, but make sure
### that the version of poi_id.py that you submit can be run on its own and
### generates the necessary .pkl files for validating your results.
#print features_list

dump_classifier_and_data(clf, my_dataset, features_list)